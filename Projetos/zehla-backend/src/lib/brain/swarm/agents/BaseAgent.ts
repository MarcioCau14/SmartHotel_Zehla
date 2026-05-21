import { prisma } from '@/lib/prisma';
import { generate as callLLM } from '@/lib/brain/llm-router';
import * as MiroFish from '@/lib/brain/use-cases/mirofish-cache';
import { TenantLocalizationService } from '@/lib/i18n/TenantLocalizationService';

/**
 * Agente Base — Classe abstrata para todos os agentes do Swarm ZEHLA
 * 
 * Cada agente especialista estende esta classe e implementa:
 * - getSystemPrompt(): prompt específico do agente
 * - getAvailableTools(): ferramentas disponíveis para o agente
 * - handle(): lógica principal de processamento
 * 
 * Princípios:
 * 1. Contexto mínimo: cada agente recebe apenas o necessário
 * 2. Cache semântico: intercepta FAQs antes de chamar LLM
 * 3. Multi-idioma: prompts adaptados ao locale da propriedade
 * 4. FinOps: custo rastreado por agente
 */

export interface AgentContext {
  propertyId: string;
  guestPhone: string;
  guestName?: string;
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
  locale: string;
  currencyCode: string;
  timezone: string;
}

export interface AgentResponse {
  reply: string;
  agentName: string;
  intent: string;
  confidence: number;
  tokensUsed: number;
  cost: number;
  requiresAction?: boolean;
  action?: {
    type: string;
    payload: any;
  };
}

export abstract class BaseAgent {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly intentPatterns: string[];
  protected readonly model: string = 'general'; // Modelo padrão (Qwen 72B free tier)

  /**
   * Gera o system prompt específico do agente
   */
  protected abstract getSystemPrompt(context: AgentContext): Promise<string>;

  /**
   * Ferramentas disponíveis para este agente
   */
  protected abstract getAvailableTools(): string[];

  /**
   * Processa a mensagem do hóspede
   */
  async handle(context: AgentContext): Promise<AgentResponse> {
    const startTime = Date.now();

    // 1. Cache Semântico (MiroFish) — intercepta óbvio
    const cached = await MiroFish.searchSimilar(context.propertyId, context.message);
    if (cached && cached.confidence > 0.92) {
      return {
        reply: cached.content,
        agentName: this.name,
        intent: this.detectIntent(context.message),
        confidence: cached.confidence,
        tokensUsed: 0,
        cost: 0,
      };
    }

    // 2. Buscar dados da propriedade
    const property = await prisma.property.findUnique({
      where: { id: context.propertyId },
      include: { rooms: true },
    });

    if (!property) {
      return this.createErrorResponse('Propriedade não encontrada');
    }

    // 3. Buscar contexto do hóspede
    const guestContext = await this.getGuestContext(context);

    // 4. Montar system prompt
    const systemPrompt = await this.getSystemPrompt({
      ...context,
      guestName: guestContext?.guestName,
    });

    // 5. Montar mensagens para LLM
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(context.conversationHistory.slice(-5)), // Últimas 5 mensagens
      { role: 'user' as const, content: context.message },
    ];

    // 6. Chamar LLM
    const llmResponse = await callLLM({
      model: 'general',
      messages,
      maxTokens: 500,
      temperature: 0.7,
    });

    const tokensUsed = llmResponse.tokensUsed || 0;
    const cost = llmResponse.cost || 0;

    // 7. Salvar no cache semântico
    if (llmResponse.content && tokensUsed < 1000) {
      await MiroFish.save(context.propertyId, context.message, llmResponse.content, this.detectIntent(context.message), tokensUsed);
    }

    // 8. Log de custo por agente
    await this.logAgentCost(context.propertyId, tokensUsed, cost);

    return {
      reply: llmResponse.content || 'Desculpe, não entendi. Pode reformular?',
      agentName: this.name,
      intent: this.detectIntent(context.message),
      confidence: 0.8,
      tokensUsed,
      cost,
    };
  }

  /**
   * Detecta intenção da mensagem baseado nos padrões do agente
   */
  detectIntent(message: string): string {
    const lower = message.toLowerCase();
    for (const pattern of this.intentPatterns) {
      if (lower.includes(pattern.toLowerCase())) {
        return pattern;
      }
    }
    return 'UNKNOWN';
  }

  /**
   * Busca contexto do hóspede (reservas anteriores, preferências)
   */
  protected async getGuestContext(context: AgentContext) {
    if (!context.guestPhone) return null;

    const lastReservation = await prisma.reservation.findFirst({
      where: {
        propertyId: context.propertyId,
        guestPhone: context.guestPhone,
      },
      orderBy: { createdAt: 'desc' },
    });

    return lastReservation;
  }

  /**
   * Cria resposta de erro padronizada
   */
  protected createErrorResponse(error: string): AgentResponse {
    return {
      reply: `Desculpe, ocorreu um erro: ${error}`,
      agentName: this.name,
      intent: 'ERROR',
      confidence: 0,
      tokensUsed: 0,
      cost: 0,
    };
  }

  /**
   * Log de custo do agente para FinOps
   */
  protected async logAgentCost(propertyId: string, tokensUsed: number, cost: number) {
    try {
      await prisma.billingLog.create({
        data: {
          propertyId,
          type: `ai_agent_${this.name.toLowerCase()}`,
          units: tokensUsed,
          cost,
          metadata: { agent: this.name, model: this.model },
        },
      });
    } catch {
      // Silencioso — não bloquear resposta por falha de log
    }
  }
}
