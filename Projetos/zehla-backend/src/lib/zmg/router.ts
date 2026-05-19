import { ContactProfile } from '@prisma/client';

import { RoutingDecision, ZMGChannel, ZMGMessageType } from './types';


/**
 * ZMG Intelligent Router
 * Decides the best channel based on cost, delivery and availability
 */


export class ZMGRouter {
  static route(
    contact: ContactProfile,
    messageType: ZMGMessageType,
    objective: string
  ): RoutingDecision[] {
    const decisions: RoutingDecision[] = [];

    // Regra 1: WhatsApp disponível? Sempre prioridade #1 pela taxa de conversão
    if (contact.whatsappAvailable) {
      // Nota: No Brasil, a janela de 24h de serviço é "grátis" em muitos providers (apenas custo de infra)
      // Aqui simulamos o custo baseado no tipo
      const cost = messageType === 'marketing' ? 0.40 : 0.04;
      
      decisions.push({
        channel: 'whatsapp',
        provider: 'evolution',
        estimatedCost: cost,
        estimatedDeliveryRate: 0.98,
        reason: `WhatsApp disponível para ${contact.phone} (${messageType})`,
      });
    }

    // Regra 2: SMS como Fallback se for Transacional (Alta prioridade)
    if (messageType === 'transactional' || messageType === 'alert') {
      decisions.push({
        channel: 'sms',
        provider: 'zapi',
        estimatedCost: 0.10, // Simulação de custo SMS
        estimatedDeliveryRate: 0.95,
        reason: 'Fallback SMS para mensagem de alta prioridade',
      });
    }

    // Regra 3: Email se disponível (Custo quase zero)
    if (contact.emailAvailable && contact.email) {
      decisions.push({
        channel: 'email',
        provider: 'amazon-ses',
        estimatedCost: 0.00006,
        estimatedDeliveryRate: 0.70,
        reason: 'Canal de baixo custo disponível',
      });
    }

    // Ordenar decisões: Menor custo / Maior entrega (Eficiência)
    // Para simplificar: Prioridade fixa (WhatsApp > SMS > Email)
    return decisions.sort((a, b) => {
      const priority: Record<string, number> = { whatsapp: 1, sms: 2, email: 3, instagram: 4 };
      return priority[a.channel] - priority[b.channel];
    });
  }
}
