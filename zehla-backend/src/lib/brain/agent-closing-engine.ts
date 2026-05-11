import { prisma } from '@/lib/prisma'
import { llmRouter } from '@/lib/ai/llm-router'

export type ClosingState = 'IDLE' | 'QUALIFYING' | 'AVAILABILITY' | 'QUOTATION' | 'OBJECTION' | 'CLOSING' | 'HANDOVER'

export interface ClosingContext {
  propertyId: string
  guestPhone: string
  intent: string
  currentState: ClosingState
  data: {
    dates?: string
    guests?: number
    roomType?: string
    objections?: string[]
  }
}

export class AgentClosingEngine {
  /**
   * Determina o próximo passo lógico para fechar a reserva com foco em Conversão.
   */
  static async determineNextAction(context: ClosingContext): Promise<{ state: ClosingState; response: string }> {
    const { propertyId, intent, data, guestPhone } = context
    
    // 1. DETECTOR DE FRUSTRAÇÃO (HANDOVER)
    const lastMessages = await prisma.message.findMany({
      where: { phone: guestPhone, direction: 'INBOUND' },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    const frustrationDetected = this.detectFrustration(lastMessages.map(m => m.content));
    if (frustrationDetected) {
      console.warn(`🚨 [HANDOVER] Frustração detectada para ${guestPhone}. Silenciando IA.`);
      await this.notifyOwner(propertyId, guestPhone, 'O hóspede parece frustrado ou com objeções complexas. Assuma a conversa.');
      return { 
        state: 'HANDOVER', 
        response: 'Entendo sua preocupação. Vou pedir para o nosso gerente de reservas te dar uma atenção especial agora mesmo. Um momento, por favor.' 
      };
    }

    // 2. BUSCA DE DADOS REAIS PARA GATILHOS (ESCUTAR O COFRE)
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { rooms: { include: { reservations: true } } }
    });

    if (!property) throw new Error('Property not found');

    // 3. LÓGICA TÁTICA DE VENDAS (CIALDINI)
    switch (intent) {
      case 'PRICE_INQUIRY':
        const availability = this.calculateScarcity(property);
        const baseResponse = await this.generateQuotationResponse(property, data);
        
        // Injeção de Gatilho de Escassez Real
        if (availability.totalAvailable <= 2) {
          return { 
            state: 'QUOTATION', 
            response: `${baseResponse}\n\n⚠️ Ricardo, notei aqui que restam apenas ${availability.totalAvailable} unidades para essa data. Como é um período de alta procura, as vagas costumam esgotar rápido.` 
          };
        }
        return { state: 'QUOTATION', response: baseResponse };

      case 'OBJECTION_PRICE':
        return { 
          state: 'OBJECTION', 
          response: `Entendo perfeitamente o valor, mas lembre-se que nossa tarifa inclui o café da manhã artesanal e acesso exclusivo à trilha privada. Posso verificar se consigo um benefício extra para você confirmar agora?` 
        };

      default:
        return { state: 'QUALIFYING', response: 'Como posso ajudar a tornar sua estadia inesquecível?' };
    }
  }

  private static detectFrustration(messages: string[]): boolean {
    const triggers = ['ruim', 'caro', 'absurdo', 'demora', 'atendente', 'humano', 'gerente', '?', '!', 'lixo'];
    return messages.some(msg => triggers.some(t => msg.toLowerCase().includes(t)));
  }

  private static calculateScarcity(property: any) {
    const totalAvailable = property.rooms.filter((r: any) => r.reservations.length === 0).length; // Simplificado
    return { totalAvailable };
  }

  private static async notifyOwner(propertyId: string, phone: string, reason: string) {
    await prisma.securityAlert.create({
      data: {
        tenantId: propertyId,
        alertType: 'HUMAN_HANDOVER_REQUIRED',
        severity: 'MEDIUM',
        metadata: JSON.stringify({ phone, reason, timestamp: new Date() })
      }
    });
  }

  private static async generateQuotationResponse(property: any, data: any): Promise<string> {
    // Integração real com os preços dos quartos
    const minPrice = Math.min(...property.rooms.map((r: any) => r.preco))
    return `Nossas diárias começam em R$ ${minPrice}. Para uma cotação exata, poderia me confirmar as datas desejadas?`
  }
}
