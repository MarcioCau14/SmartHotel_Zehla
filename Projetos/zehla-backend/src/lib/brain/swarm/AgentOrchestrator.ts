import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as MiroFish from '@/lib/brain/use-cases/mirofish-cache';
import { generate as callLLM } from '@/lib/brain/llm-router';
import { BaseAgent, AgentContext, AgentResponse } from './agents/BaseAgent';
import { ReceptionistAgent } from './agents/ReceptionistAgent';
import { ConciergeAgent } from './agents/ConciergeAgent';
import { FinancialAgent } from './agents/FinancialAgent';

/**
 * AgentOrchestrator — O Cérebro do Swarm ZEHLA
 * 
 * Arquitetura Multi-Agente (Swarm Pattern):
 * 1. Cache Semântico (MiroFish) intercepta óbvio
 * 2. Classificador de intenção rápido (modelo barato)
 * 3. Roteamento para agente especialista
 * 4. Estado compartilhado via Redis (histórico entre agentes)
 * 
 * Benefícios:
 * - Redução de custos: classificador usa modelo barato, especialistas usam modelo adequado
 * - Precisão: cada agente tem contexto e ferramentas específicas
 * - Segurança: Agente Financeiro isolado com validações extras
 * - FinOps: custo rastreado por agente
 */

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent>;
  private readonly classifierModel = 'fast'; // Modelo rápido para classificação (Llama 3.3 free tier)

  constructor() {
    this.agents = new Map();
    this.registerAgents();
  }

  /**
   * Registra todos os agentes do swarm
   */
  private registerAgents() {
    this.agents.set('receptionist', new ReceptionistAgent());
    this.agents.set('concierge', new ConciergeAgent());
    this.agents.set('financial', new FinancialAgent());
  }

  /**
   * Roteia e executa a mensagem do hóspede
   * 
   * Fluxo:
   * 1. Cache semântico → se hit, retorna imediatamente
   * 2. Classificação de intenção → decide qual agente usar
   * 3. Agente especialista processa
   * 4. Estado compartilhado atualizado no Redis
   */
  async routeAndExecute(
    propertyId: string,
    guestPhone: string,
    message: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    // Buscar configurações de i18n da propriedade
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { locale: true, currencyCode: true, timezone: true, name: true },
    });

    const context: AgentContext = {
      propertyId,
      guestPhone,
      message,
      conversationHistory,
      locale: property?.locale || 'pt-BR',
      currencyCode: property?.currencyCode || 'BRL',
      timezone: property?.timezone || 'America/Sao_Paulo',
    };

    // 1. CACHE SEMÂNTICO (MiroFish) — intercepta óbvio
    const cached = await MiroFish.searchSimilar(propertyId, message);
    if (cached && cached.confidence > 0.95) {
      return {
        reply: cached.content,
        agentName: 'Cache',
        intent: cached.intent || 'FAQ',
        confidence: cached.confidence,
        tokensUsed: 0,
        cost: 0,
      };
    }

    // 2. CLASSIFICAÇÃO DE INTENÇÃO (modelo barato)
    const intent = await this.classifyIntent(message);
    console.log(`🧠 [SWARM] Intenção classificada: ${intent} (${message.slice(0, 50)}...)`);

    // 3. ROTEAMENTO PARA AGENTE ESPECIALISTA
    const agent = this.selectAgent(intent);
    console.log(`🔄 [SWARM] Roteando para agente: ${agent.name}`);

    // 4. EXECUTAR AGENTE
    const response = await agent.handle(context);

    // 5. ATUALIZAR ESTADO COMPARTILHADO (Redis)
    await this.updateSharedState(propertyId, guestPhone, {
      lastAgent: agent.name,
      lastIntent: intent,
      lastMessage: message.slice(0, 200),
      lastReply: response.reply.slice(0, 200),
      timestamp: Date.now(),
    });

    // 6. LOG DE PERFORMANCE
    const duration = Date.now() - startTime;
    console.log(`⚡ [SWARM] ${agent.name} respondeu em ${duration}ms (${response.tokensUsed} tokens, R$${response.cost.toFixed(4)})`);

    return response;
  }

  /**
   * Classifica a intenção da mensagem usando modelo barato
   */
  private async classifyIntent(message: string): Promise<string> {
    const systemPrompt = `Você é um classificador de intenções para um sistema hoteleiro.
Classifique a mensagem do hóspede em UMA das categorias abaixo.
Responda APENAS com o nome da categoria, sem explicações.

CATEGORIAS:
- BOOKING_OR_FAQ: Reservas, disponibilidade, informações gerais, check-in/out
- UPSELL_OR_EXPERIENCE: Passeios, restaurantes, upgrades, experiências, vinho, spa
- NEGOTIATION_OR_REFUND: Descontos, estornos, reembolsos, reclamações de preço, notas fiscais

Exemplos:
"Qual o preço do quarto?" → BOOKING_OR_FAQ
"Tem algum passeio na região?" → UPSELL_OR_EXPERIENCE
"Pode me dar um desconto?" → NEGOTIATION_OR_REFUND
"Quero cancelar minha reserva" → BOOKING_OR_FAQ
"Quero um reembolso" → NEGOTIATION_OR_REFUND`;

    try {
      const response = await callLLM({
        model: 'general',
        messages: [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: message },
        ],
        maxTokens: 20,
        temperature: 0.1,
      });

      const classification = response.content?.trim().toUpperCase() || 'BOOKING_OR_FAQ';

      // Mapear classificação para agente
      if (classification.includes('NEGOTIATION') || classification.includes('REFUND')) {
        return 'NEGOTIATION_OR_REFUND';
      }
      if (classification.includes('UPSELL') || classification.includes('EXPERIENCE')) {
        return 'UPSELL_OR_EXPERIENCE';
      }
      return 'BOOKING_OR_FAQ';

    } catch (error) {
      console.error('❌ [SWARM] Erro na classificação de intenção:', error);
      return 'BOOKING_OR_FAQ'; // Fallback seguro
    }
  }

  /**
   * Seleciona o agente especialista baseado na intenção
   */
  private selectAgent(intent: string): BaseAgent {
    switch (intent) {
      case 'NEGOTIATION_OR_REFUND':
        return this.agents.get('financial')!;
      case 'UPSELL_OR_EXPERIENCE':
        return this.agents.get('concierge')!;
      case 'BOOKING_OR_FAQ':
      default:
        return this.agents.get('receptionist')!;
    }
  }

  /**
   * Atualiza estado compartilhado no Redis
   * Permite que agentes compartilhem contexto entre si
   */
  private async updateSharedState(
    propertyId: string,
    guestPhone: string,
    state: Record<string, any>
  ) {
    try {
      const key = `swarm:state:${propertyId}:${guestPhone}`;
      await redis.set(key, JSON.stringify(state), 'EX', 3600); // 1 hora de TTL
    } catch (error) {
      console.warn('⚠️ [SWARM] Falha ao atualizar estado compartilhado:', error);
    }
  }

  /**
   * Busca estado compartilhado do Redis
   */
  async getSharedState(propertyId: string, guestPhone: string): Promise<Record<string, any> | null> {
    try {
      const key = `swarm:state:${propertyId}:${guestPhone}`;
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Lista todos os agentes registrados
   */
  getRegisteredAgents(): Array<{ name: string; description: string; intents: string[] }> {
    return Array.from(this.agents.values()).map(agent => ({
      name: agent.name,
      description: agent.description,
      intents: agent.intentPatterns,
    }));
  }
}

// Singleton
export const agentOrchestrator = new AgentOrchestrator();
