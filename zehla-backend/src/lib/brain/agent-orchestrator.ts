import { DNAVoiceAdapter } from '../voice/dna-voice-adapter';
import { ProcessPaymentProofUseCase } from './use-cases/ProcessPaymentProofUseCase';
import { ReceiptExtractor } from './receipt-extractor'
import { AgentRequest, AgentResponse } from '@/types'
import { prisma } from '../prisma'
import { getCachedResponse, setCachedResponse } from '@/lib/ai/semanticCache'
import { llmRouter } from '../ai/llm-router'
import { akashicBridge } from '../akashico/AkashicBridge'
import { SecurityProcessor } from './processors/SecurityProcessor';
import { TrialValidator } from './processors/TrialValidator';
import { PromptBuilder } from './processors/PromptBuilder';

// Utilitários de segurança simulados para o contexto
const classifyIntent = async (p: string) => ({ intent: 'GREETING', confidence: 0.9, entities: {} });

export class AgentOrchestrator {
  async process(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now()
    const { propertyId, message = '' } = request
    const context = request.context as any || {}
    const useNeuralVoice = context?.useNeuralVoice === true;

    // 1. HARDENING & SEGURANÇA (PII / Injection)
    const securityResult = await SecurityProcessor.validate(message, propertyId);
    if (!securityResult.success) {
      return this.buildError(securityResult.error || 'Security violation', startTime, 'SYSTEM');
    }
    const safeMessage = securityResult.safeMessage!;

    // 2. Classificar intent
    const classified = await classifyIntent(safeMessage)
    const intent = classified.intent

    // 3. Validar Propriedade e Trial
    const trialResult = await TrialValidator.validate(propertyId);
    if (!trialResult.success) {
      return this.buildError(trialResult.error || 'Trial expired', startTime, 'SYSTEM');
    }
    const property = trialResult.property!;

    // 4. Tratamento de Fornecedores (Regra de Negócio Crítica)
    if (intent === 'SUPPLIER_INQUIRY' && property.whatsappChannelType === 'GUESTS_ONLY') {
      const supplierMessage = property.supplierContact 
        ? `Olá! Este canal de WhatsApp é exclusivo para atendimento a hóspedes e reservas da ${property.name}. Para assuntos comerciais ou fornecedores, por favor entre em contato pelo número: ${property.supplierContact}. Obrigado pela compreensão!`
        : `Olá! Este canal de WhatsApp é exclusivo para atendimento a hóspedes e reservas da ${property.name}. No momento, não tratamos de assuntos de fornecedores por este canal. Obrigado pela compreensão!`;

      return {
        success: true,
        agent: 'SYSTEM',
        intent: 'SUPPLIER_INQUIRY',
        confidence: classified.confidence,
        response: supplierMessage,
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime
      };
    }

    // 5. Motor de Extração de Comprovantes
    const receiptData = await ReceiptExtractor.extract(message);
    if (receiptData) {
      const result = await ProcessPaymentProofUseCase.execute(
        context.phone,
        propertyId,
        receiptData,
        context.reservationId
      );

      if (result.success) {
        return {
          success: true,
          agent: 'FINANCIAL',
          intent: 'PAYMENT_CONFIRMATION',
          confidence: 1.0,
          response: `Recebi seu comprovante de R$ ${result.amount?.toLocaleString('pt-BR')}! 🎉 Já confirmei sua reserva automaticamente. Seja bem-vindo à ${property.name}!`,
          tokensUsed: 0, cost: 0, duration: Date.now() - startTime
        };
      } else {
        return {
          success: true,
          agent: 'FINANCIAL',
          intent: 'PAYMENT_CONFIRMATION',
          confidence: 1.0,
          response: `Recebi seu comprovante! 🚀 Como não localizei sua reserva pendente agora, nossa equipe fará a conferência manual e te avisamos em instantes.`,
          tokensUsed: 0, cost: 0, duration: Date.now() - startTime
        };
      }
    }

    // 6. Gerar Prompts Contextualizados
    const { systemPrompt, userPrompt } = await PromptBuilder.build(
      property, 
      intent, 
      message, 
      classified, 
      context
    );

    // 7. SEMANTIC CACHE (Escudo Financeiro)
    const cachedResponse = await getCachedResponse(userPrompt, propertyId);
    if (cachedResponse) {
      return {
        success: true,
        agent: this.getAgentName(intent),
        intent,
        confidence: classified.confidence,
        response: cachedResponse,
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime
      };
    }

    // 8. Execução LLM via Router (roteamento por agente)
    const agentType = this.getAgentType(intent)
    const llmResponse = await llmRouter.generate({
      model: intent === 'PRICE_INQUIRY' || intent === 'RESERVATION_CREATE' ? 'reasoning' : 'general',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 2048,
      agentType
    })

    // Gravar no cache
    await setCachedResponse(userPrompt, propertyId, llmResponse.content);

    // 9. Log da interação
    await prisma.agentLog.create({
      data: {
        agentName: this.getAgentName(intent),
        action: 'RESPOND',
        intent,
        confidence: classified.confidence,
        input: message,
        output: llmResponse.content,
        tokensUsed: llmResponse.tokensUsed,
        cost: llmResponse.cost,
        duration: Date.now() - startTime,
        status: 'SUCCESS',
        propertyId
      }
    })

    // 10. Ingestão no Campo Akáshico (fire-and-forget)
    const phone = (context?.phone as string) || ''
    void akashicBridge.ingestEvent({
      pousada_id: propertyId,
      source_channel: 'whatsapp',
      guest_id: phone || undefined,
      input_text: message,
      intent_classified: intent,
      ai_response: llmResponse.content,
      provider_used: llmResponse.model || 'unknown',
      tier_used: llmResponse.cost > 0 ? 2 : 1,
      outcome: 'resolved',
      sentiment_after: 0,
      duration_ms: Date.now() - startTime,
      tokens_used: llmResponse.tokensUsed,
      cadmas_bucket: 4,
    })

    // 11. Preparar Resposta Final com Metadados de Voz
    const response: AgentResponse = {
      success: true,
      agent: this.getAgentName(intent),
      intent,
      confidence: classified.confidence,
      response: llmResponse.content,
      tokensUsed: llmResponse.tokensUsed,
      cost: llmResponse.cost,
      duration: Date.now() - startTime
    }

    if (useNeuralVoice && (property.plan === 'PRO' || property.plan === 'MAX')) {
      const isMax = property.plan === 'MAX';
      if (isMax) {
        const adaptation = await DNAVoiceAdapter.getAdaptiveParams(request.sessionId || propertyId);
        response.voice = {
          enabled: true,
          tier: 'MAX',
          adaptation: {
            rate: adaptation.speaking_rate,
            pitch: adaptation.pitch,
            style: adaptation.style,
            emotiveness: adaptation.emotiveness
          },
          instruction: DNAVoiceAdapter.getSystemInstruction(adaptation)
        };
      } else {
        response.voice = { enabled: true, tier: 'PRO' };
      }
    }

    return response;
  }

  private getAgentName(intent: string): string {
    const map: Record<string, string> = {
      RESERVATION_CREATE: 'RECEPTIONIST',
      RESERVATION_MODIFY: 'RECEPTIONIST',
      RESERVATION_CANCEL: 'RECEPTIONIST',
      ROOM_AVAILABILITY: 'RECEPTIONIST',
      PRICE_INQUIRY: 'RECEPTIONIST',
      CHECK_IN: 'RESERVATIONS',
      CHECK_OUT: 'RESERVATIONS',
      HOUSEKEEPING_REQUEST: 'HOUSEKEEPING',
      AMENITIES_INQUIRY: 'CONCIERGE',
      LOCAL_INFO: 'CONCIERGE',
      PAYMENT_STATUS: 'FINANCIAL',
      CANCELATION_POLICY: 'FINANCIAL',
      GREETING: 'RECEPTIONIST',
      FAREWELL: 'RECEPTIONIST',
      SUPPLIER_INQUIRY: 'SYSTEM',
      UNKNOWN: 'RECEPTIONIST'
    }
    return map[intent] || 'RECEPTIONIST'
  }

  private getAgentType(intent: string): 'ze-sales' | 'ze-analyst' | 'general' {
    const salesIntents = ['PRICE_INQUIRY', 'RESERVATION_CREATE', 'RESERVATION_MODIFY', 'RESERVATION_CANCEL',
      'CHECK_IN', 'CHECK_OUT', 'PAYMENT_STATUS']
    const analystIntents = ['ROOM_AVAILABILITY', 'CANCELATION_POLICY']
    if (salesIntents.includes(intent)) return 'ze-sales'
    if (analystIntents.includes(intent)) return 'ze-analyst'
    return 'general'
  }

  private buildError(message: string, startTime: number, agent: string = 'SYSTEM'): AgentResponse {
    return {
      success: false,
      agent,
      intent: 'UNKNOWN',
      confidence: 0,
      response: message.startsWith('[ZEHLA') ? message : `Desculpe, ocorreu um erro: ${message}. Por favor, tente novamente ou fale com nossa equipe.`,
      tokensUsed: 0,
      cost: 0,
      duration: Date.now() - startTime
    }
  }
}

export const orchestrator = new AgentOrchestrator()
