import { CognitiveTerminal } from '@/lib/observability/cognitive-terminal';
import { llmRouter } from '@/lib/ai/llm-router';
import { prisma } from '@/lib/prisma';

import { WhatsappPersonaLearner } from './whatsapp-persona-learner';


export type ClosingState = 'IDLE' | 'QUALIFYING' | 'AVAILABILITY' | 'QUOTATION' | 'OBJECTION' | 'CLOSING' | 'HANDOVER'

export class AgentClosingEngine {
  /**
   * MÁQUINA DE CONVERSÃO (Jornada do Hóspede)
   * Processa a negociação e gera uma resposta focada em FECHAMENTO.
   */
  static async processNegotiation(propertyId: string, leadId: string, lastMessages: unknown[]) {
    try {
      // 1. CARGA DE CONTEXTO (Bancada de Inox)
      const [property, persona, trends, lead] = await Promise.all([
        prisma.property.findUnique({
          where: { id: propertyId },
          include: { rooms: { include: { reservations: { where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } } } } } }
        }),
        WhatsappPersonaLearner.getPersona(propertyId),
        this.getRecentTrends(),
        prisma.lead.findUnique({ where: { id: leadId } })
      ]);

      if (!property || !lead) throw new Error('Propriedade ou Lead não encontrado');

      // 2. AUDITORIA DE DISPONIBILIDADE (Escassez Real)
      const availability = this.calculateRealAvailability(property);
      
      // 3. DETECÇÃO DE HANDOVER (Segurança)
      if (this.detectHandoverNeed(lastMessages)) {
        await this.triggerHandover(propertyId, lead.whatsapp, 'Solicitação de humano ou atrito detectado.');
        return { 
          state: 'HANDOVER', 
          response: 'Entendo perfeitamente. Vou pedir para o nosso gerente de reservas te dar uma atenção especial agora mesmo. Um momento.' 
        };
      }

      // 4. GERAÇÃO TÁTICA (Kimi K2.6 / DeepSeek)
      const prompt = this.buildClosingPrompt(property, persona, availability, trends, lead, lastMessages);
      
      const response = await llmRouter.generate({
        model: 'reasoning', // DeepSeek-R1 para tática de vendas
        messages: [
          { role: 'system', content: `Você é o hoteleiro da pousada ${property.nome}. Seu DNA: ${persona.tone}. REGRAS: ${persona.rules.join('. ')}` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        maxTokens: 1000
      });

      await CognitiveTerminal.success('CLOSING-ENGINE', `Resposta de fechamento gerada para lead ${lead.name}`, { leadId });

      return { state: 'CLOSING', response: response.content };

    } catch (error) {
      await CognitiveTerminal.error('CLOSING-ENGINE', `Falha no processamento da negociação: ${leadId}`, propertyId, error);
      throw error;
    }
  }

  private static calculateRealAvailability(property: unknown) {
    const totalRooms = property.rooms.length;
    const occupiedRooms = property.rooms.filter((r: unknown) => r.reservations.length > 0).length;
    const available = totalRooms - occupiedRooms;
    
    return {
      available,
      isLow: available <= 2,
      percentage: Math.round((available / totalRooms) * 100)
    };
  }

  private static async getRecentTrends() {
    // Busca sinais de clima e feriados próximos para injetar na oferta
    const [weather, holidays] = await Promise.all([
      prisma.weatherSignal.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
      prisma.holidaySignal.findMany({ where: { daysUntil: { lte: 15 } }, take: 1 })
    ]);

    return { weather, holidays };
  }

  private static detectHandoverNeed(messages: unknown[]): boolean {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const triggers = ['falar com humano', 'atendente', 'gerente', 'reclamação', 'estou bravo', 'ruim', 'não gostei', 'falar com o dono'];
    return triggers.some(t => lastMessage.includes(t));
  }

  private static async triggerHandover(propertyId: string, phone: string, reason: string) {
    await prisma.securityAlert.create({
      data: {
        tenantId: propertyId,
        alertType: 'HUMAN_HANDOVER_REQUIRED',
        severity: 'MEDIUM',
        metadata: JSON.stringify({ phone, reason, timestamp: new Date() })
      }
    });
    await CognitiveTerminal.warn('SECURITY', `Handover ativado para ${phone}: ${reason}`, { propertyId });
  }

  private static buildClosingPrompt(property: unknown, persona: unknown, availability: unknown, trends: unknown, lead: unknown, history: unknown[]) {
    const historyText = history.map(m => `${m.role === 'user' ? 'Hóspede' : 'Pousada'}: ${m.content}`).join('\n');
    
    let trendContext = '';
    if (trends.holidays.length > 0) {
      trendContext += `\n- FERIADO PRÓXIMO: ${trends.holidays[0].name} em ${trends.holidays[0].daysUntil} dias.`;
    }
    if (trends.weather.length > 0) {
      trendContext += `\n- CLIMA: Previsão de ${trends.weather[0].condition} com ${trends.weather[0].avgTemp}°C.`;
    }

    return `
CONTEXTO DE NEGOCIAÇÃO:
Hóspede: ${lead.name}
Cidade: ${lead.city}
Estágio: ${lead.funnelStage}
Score: ${lead.conversionScore}

DISPONIBILIDADE REAL (NÃO MINTA):
- Suítes Livres: ${availability.available}
- Status: ${availability.isLow ? 'CRÍTICO (USE ESCASSEZ REAL)' : 'NORMAL'}
${trendContext}

HISTÓRICO:
${historyText}

TAREFA:
Gere uma resposta de fechamento mimetizando o hoteleiro (${persona.tone}).
Use as expressões: ${persona.commonExpressions.join(', ')}.
Se a disponibilidade for baixa (${availability.available}), use escassez real.
Se houver feriado próximo, crie urgência.
Se o clima estiver bom, use como argumento de venda.
OBJETIVO: Levar o hóspede a confirmar a reserva AGORA. Responda em Português.
    `;
  }
}
