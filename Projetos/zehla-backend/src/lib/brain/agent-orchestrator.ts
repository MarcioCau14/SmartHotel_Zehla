import { DNAVoiceAdapter } from '../voice/dna-voice-adapter';
import { ProcessPaymentProofUseCase } from './use-cases/ProcessPaymentProofUseCase';
import { ReceiptExtractor } from './receipt-extractor';
import { SecurityProcessor } from './processors/SecurityProcessor';
import { TrialValidator } from './processors/TrialValidator';
import { PromptBuilder } from './processors/PromptBuilder';
import { classifyIntent, type ClassifiedIntent } from './intent-classifier';
import { executeTool } from './zehla-tools';

export interface ProcessContext {
  request: AgentRequest;
  startTime: number;
  safeMessage: string;
  security: { hasPII: boolean; detectedTypes: string[] };
  classified: ClassifiedIntent;
  property?: any;
  response?: AgentResponse;
  receiptData?: any;
  systemPrompt?: string;
  userPrompt?: string;
}

export abstract class AgentHandler {
  protected next: AgentHandler | null = null;

  setNext(handler: AgentHandler): AgentHandler {
    this.next = handler;
    return handler;
  }

  async handle(ctx: ProcessContext): Promise<ProcessContext> {
    const result = await this.process(ctx);
    if (result.response) return result;
    if (this.next) return this.next.handle(result);
    return result;
  }

  protected abstract process(ctx: ProcessContext): Promise<ProcessContext>;

  protected buildResponse(ctx: ProcessContext, overrides: Partial<AgentResponse> = {}): ProcessContext {
    ctx.response = {
      success: true,
      agent: 'SYSTEM',
      intent: ctx.classified?.intent || 'UNKNOWN',
      confidence: ctx.classified?.confidence || 0,
      response: '',
      tokensUsed: 0,
      cost: 0,
      duration: Date.now() - ctx.startTime,
      ...overrides
    };
    return ctx;
  }

  protected buildError(ctx: ProcessContext, message: string, agent: string = 'SYSTEM'): ProcessContext {
    ctx.response = {
      success: false,
      agent,
      intent: 'UNKNOWN',
      confidence: 0,
      response: message.startsWith('[ZEHLA') ? message : `Desculpe, ocorreu um erro: ${message}. Por favor, tente novamente ou fale com nossa equipe.`,
      tokensUsed: 0,
      cost: 0,
      duration: Date.now() - ctx.startTime
    };
    return ctx;
  }
}

class SecurityHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    const { propertyId, message = '' } = ctx.request;
    const securityResult = await SecurityProcessor.validate(message, propertyId);
    if (!securityResult.success) {
      return this.buildError(ctx, securityResult.error || 'Security violation', 'SYSTEM');
    }
    ctx.safeMessage = securityResult.safeMessage!;
    ctx.security = { hasPII: securityResult.hasPII || false, detectedTypes: securityResult.detectedTypes || [] };
    return ctx;
  }
}

class IntentClassifierHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    ctx.classified = await classifyIntent(ctx.safeMessage);
    return ctx;
  }
}

class TrialValidatorHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    const trialResult = await TrialValidator.validate(ctx.request.propertyId);
    if (!trialResult.success) {
      return this.buildError(ctx, trialResult.error || 'Trial expired', 'SYSTEM');
    }
    ctx.property = trialResult.property!;
    return ctx;
  }
}

class SupplierHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    if (ctx.classified.intent === 'SUPPLIER_INQUIRY' && ctx.property?.whatsappChannelType === 'GUESTS_ONLY') {
      const msg = ctx.property.supplierContact
        ? `Olá! Este canal de WhatsApp é exclusivo para atendimento a hóspedes e reservas da ${ctx.property.name}. Para assuntos comerciais ou fornecedores, por favor entre em contato pelo número: ${ctx.property.supplierContact}. Obrigado pela compreensão!`
        : `Olá! Este canal de WhatsApp é exclusivo para atendimento a hóspedes e reservas da ${ctx.property.name}. No momento, não tratamos de assuntos de fornecedores por este canal. Obrigado pela compreensão!`;
      return this.buildResponse(ctx, { response: msg, intent: 'SUPPLIER_INQUIRY' });
    }
    return ctx;
  }
}

class ReceiptHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    const context = ctx.request.context as any || {};
    ctx.receiptData = await ReceiptExtractor.extract(ctx.safeMessage);
    if (ctx.receiptData) {
      const result = await ProcessPaymentProofUseCase.execute(context.phone, ctx.request.propertyId, ctx.receiptData, context.reservationId);
      const msg = result.success
        ? `Recebi seu comprovante de R$ ${result.amount?.toLocaleString('pt-BR')}! 🎉 Já confirmei sua reserva automaticamente. Seja bem-vindo à ${ctx.property?.name}!`
        : `Recebi seu comprovante! 🚀 Como não localizei sua reserva pendente agora, nossa equipe fará a conferência manual e te avisamos em instantes.`;
      return this.buildResponse(ctx, { agent: 'FINANCIAL', intent: 'PAYMENT_CONFIRMATION', confidence: 1.0, response: msg });
    }
    return ctx;
  }
}

class PromptBuilderHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    const context = ctx.request.context as any || {};
    const { systemPrompt, userPrompt } = await PromptBuilder.build(ctx.property, ctx.classified.intent, ctx.request.message || '', ctx.classified, context);
    ctx.systemPrompt = systemPrompt;
    ctx.userPrompt = userPrompt;
    return ctx;
  }
}

class ToolCallingHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    const intent = ctx.classified.intent;
    const toolsToCall: Array<{ name: string; args: Record<string, any> }> = [];
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    toolsToCall.push({ name: 'zehla_buscar_dados_property', args: { pousada_id: ctx.request.propertyId } });

    switch (intent) {
      case 'PRICE_INQUIRY':
        toolsToCall.push({ name: 'zehla_sugerir_preco', args: { pousada_id: ctx.request.propertyId, tipo_quarto: (ctx.classified.entities as any)?.accommodation_type || 'standard', data_checkin: (ctx.classified.entities as any)?.check_in || today, data_checkout: (ctx.classified.entities as any)?.check_out || thirtyDaysFromNow } });
        toolsToCall.push({ name: 'zehla_analisar_ocupacao', args: { pousada_id: ctx.request.propertyId, periodo_inicio: thirtyDaysAgo, periodo_fim: thirtyDaysFromNow } });
        break;
      case 'ROOM_AVAILABILITY':
      case 'RESERVATION_CREATE':
        toolsToCall.push({ name: 'zehla_analisar_ocupacao', args: { pousada_id: ctx.request.propertyId, periodo_inicio: today, periodo_fim: thirtyDaysFromNow } });
        break;
      case 'LOCAL_INFO':
      case 'AMENITIES_INQUIRY':
        break;
      case 'CHECK_IN':
      case 'CHECK_OUT':
        toolsToCall.push({ name: 'zehla_gerar_relatorio_diario', args: { pousada_id: ctx.request.propertyId, data: today } });
        break;
    }

    const results: Record<string, any> = {};
    for (const { name, args } of toolsToCall) {
      try {
        const raw = await executeTool(name, args);
        results[name] = JSON.parse(raw);
      } catch (e) {
        results[name] = { error: String(e) };
      }
    }

    const toolContextBlock = Object.entries(results)
      .filter(([, v]) => !v.error)
      .map(([k, v]) => `[${k}]\n${JSON.stringify(v, null, 2)}`)
      .join('\n\n');

    if (toolContextBlock) {
      ctx.systemPrompt = (ctx.systemPrompt || '') + `\n\n## DADOS DO BANCO (consulta em tempo real)\n${toolContextBlock}`;
    }

    return ctx;
  }
}

class SemanticCacheHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    const cached = await getCachedResponse(ctx.userPrompt!, ctx.request.propertyId);
    if (cached) {
      return this.buildResponse(ctx, {
        agent: getAgentName(ctx.classified.intent),
        response: cached,
        tokensUsed: 0,
        cost: 0
      });
    }
    return ctx;
  }
}

class LLMExecutionHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    const llmResponse = await llmRouter.generate({
      model: ctx.classified.intent === 'PRICE_INQUIRY' || ctx.classified.intent === 'RESERVATION_CREATE' ? 'reasoning' : 'general',
      messages: [
        { role: 'system', content: ctx.systemPrompt! },
        { role: 'user', content: ctx.userPrompt! }
      ],
      temperature: 0.7,
      maxTokens: 2048
    });

    await setCachedResponse(ctx.userPrompt!, ctx.request.propertyId, llmResponse.content);
    ctx.response = {
      success: true,
      agent: getAgentName(ctx.classified.intent),
      intent: ctx.classified.intent,
      confidence: ctx.classified.confidence,
      response: llmResponse.content,
      tokensUsed: llmResponse.tokensUsed,
      cost: llmResponse.cost,
      duration: Date.now() - ctx.startTime
    };
    return ctx;
  }
}

class LoggingHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    if (ctx.response && ctx.response.tokensUsed !== undefined) {
      await prisma.agentLog.create({
        data: {
          agentName: ctx.response.agent,
          action: 'RESPOND',
          intent: ctx.classified.intent,
          confidence: ctx.classified.confidence,
          input: ctx.request.message || '',
          output: ctx.response.response,
          tokensUsed: ctx.response.tokensUsed || 0,
          cost: ctx.response.cost || 0,
          duration: Date.now() - ctx.startTime,
          status: 'SUCCESS',
          propertyId: ctx.request.propertyId
        }
      });
    }
    return ctx;
  }
}

class VoiceHandler extends AgentHandler {
  async process(ctx: ProcessContext): Promise<ProcessContext> {
    if (!ctx.response || ctx.response.tokensUsed === undefined) return ctx;
    const context = ctx.request.context as any || {};
    const useNeuralVoice = context?.useNeuralVoice === true;
    if (useNeuralVoice && (ctx.property?.plan === 'PRO' || ctx.property?.plan === 'MAX')) {
      if (ctx.property.plan === 'MAX') {
        const adaptation = await DNAVoiceAdapter.getAdaptiveParams(ctx.request.sessionId || ctx.request.propertyId);
        ctx.response.voice = {
          enabled: true,
          tier: 'MAX',
          adaptation: { rate: adaptation.speaking_rate, pitch: adaptation.pitch, style: adaptation.style, emotiveness: adaptation.emotiveness },
          instruction: DNAVoiceAdapter.getSystemInstruction(adaptation)
        };
      } else {
        ctx.response.voice = { enabled: true, tier: 'PRO' };
      }
    }
    return ctx;
  }
}

function getAgentName(intent: string): string {
  const map: Record<string, string> = {
    RESERVATION_CREATE: 'RECEPTIONIST', RESERVATION_MODIFY: 'RECEPTIONIST',
    RESERVATION_CANCEL: 'RECEPTIONIST', ROOM_AVAILABILITY: 'RECEPTIONIST',
    PRICE_INQUIRY: 'RECEPTIONIST', CHECK_IN: 'RESERVATIONS',
    CHECK_OUT: 'RESERVATIONS', HOUSEKEEPING_REQUEST: 'HOUSEKEEPING',
    AMENITIES_INQUIRY: 'CONCIERGE', LOCAL_INFO: 'CONCIERGE',
    PAYMENT_STATUS: 'FINANCIAL', CANCELATION_POLICY: 'FINANCIAL',
    GREETING: 'RECEPTIONIST', FAREWELL: 'RECEPTIONIST',
    SUPPLIER_INQUIRY: 'SYSTEM', UNKNOWN: 'RECEPTIONIST'
  };
  return map[intent] || 'RECEPTIONIST';
}

export class AgentOrchestrator {
  private chain: AgentHandler;

  constructor() {
    this.chain = new SecurityHandler();
    this.chain
      .setNext(new IntentClassifierHandler())
      .setNext(new TrialValidatorHandler())
      .setNext(new SupplierHandler())
      .setNext(new ReceiptHandler())
      .setNext(new PromptBuilderHandler())
      .setNext(new ToolCallingHandler())
      .setNext(new SemanticCacheHandler())
      .setNext(new LLMExecutionHandler())
      .setNext(new LoggingHandler())
      .setNext(new VoiceHandler());
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    const ctx: ProcessContext = {
      request,
      startTime: Date.now(),
      safeMessage: '',
      security: { hasPII: false, detectedTypes: [] },
      classified: { intent: 'UNKNOWN', confidence: 0, entities: {}, rawMessage: request.message || '' }
    };
    const result = await this.chain.handle(ctx);
    return result.response!;
  }
}

export const orchestrator = new AgentOrchestrator();
