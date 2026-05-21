import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { prisma } from '@/lib/prisma';
import { TenantLocalizationService } from '@/lib/i18n/TenantLocalizationService';

/**
 * Agente Recepcionista — Especialista em reservas, FAQs e atendimento geral
 * 
 * Responsabilidades:
 * - Verificar disponibilidade de quartos
 * - Criar e modificar reservas
 * - Responder FAQs sobre a propriedade
 * - Fornecer informações sobre check-in/check-out
 * 
 * NÃO faz:
 * - Negociações de preço (encaminha para FinancialAgent)
 * - Upsells de experiências (encaminha para ConciergeAgent)
 */

export class ReceptionistAgent extends BaseAgent {
  readonly name = 'Recepcionista';
  readonly description = 'Agente especialista em reservas, disponibilidade e atendimento geral';
  readonly intentPatterns = [
    'reservar', 'reserva', 'booking', 'disponível', 'disponibilidade',
    'quarto', 'room', 'check-in', 'check-out', 'hospedar',
    'horário', 'horario', 'funcionamento', 'recepção', 'recepcao',
    'wifi', 'estacionamento', 'café', 'cafe', 'piscina',
    'cancelar', 'cancelamento', 'alterar', 'modificar',
    'qual o preço', 'quanto custa', 'valor', 'preço', 'preco',
  ];

  protected async getSystemPrompt(context: AgentContext): Promise<string> {
    const property = await prisma.property.findUnique({
      where: { id: context.propertyId },
      include: { rooms: true },
    });

    if (!property) return 'Você é um assistente de hotel.';

    const t = (key: string) => {
      const keys = key.split('.');
      const dicts: Record<string, any> = {
        'pt-BR': { role: 'recepcionista', greeting: 'Olá' },
        'es-ES': { role: 'recepcionista', greeting: 'Hola' },
        'en-US': { role: 'receptionist', greeting: 'Hello' },
      };
      const dict = dicts[context.locale] || dicts['pt-BR'];
      return keys.reduce((obj, k) => obj?.[k], dict) || key;
    };

    const formatPrice = (amount: number) =>
      TenantLocalizationService.formatCurrency(amount, context.currencyCode, context.locale);

    const roomsList = property.rooms
      .filter(r => r.status === 'AVAILABLE')
      .map(r => `- ${r.name || r.number} (${r.type}): ${r.capacity} hóspedes, ${formatPrice(r.basePrice)}/noite`)
      .join('\n') || 'Nenhum quarto disponível no momento.';

    const langInstructions: Record<string, string> = {
      'pt-BR': `Você é o(a) Recepcionista IA da ${property.name}.
Sua função é atender hóspedes com cordialidade e eficiência, verificar disponibilidade e gerenciar reservas.
Responda SEMPRE em português brasileiro.`,
      'es-ES': `Eres el/la Recepcionista IA de ${property.name}.
Tu función es atender huéspedes con cordialidad y eficiencia, verificar disponibilidad y gestionar reservas.
Responde SIEMPRE en español.`,
      'en-US': `You are the AI Receptionist of ${property.name}.
Your role is to assist guests warmly and efficiently, check availability, and manage reservations.
Always respond in English.`,
    };

    const instruction = langInstructions[context.locale] || langInstructions['pt-BR'];

    return `${instruction}

INFORMAÇÕES DA PROPRIEDADE:
- Nome: ${property.name}
- Endereço: ${property.address}, ${property.city}/${property.state}
- WhatsApp: ${property.whatsapp || 'Não informado'}

QUARTOS DISPONÍVEIS:
${roomsList}

REGRAS:
- Seja cordial e profissional
- Mantenha respostas concisas (máx. 3-4 frases)
- Para reservas, colete: datas, número de hóspedes, tipo de quarto
- Se o hóspede pedir desconto ou negociação, diga: "Vou encaminhar sua solicitação para nosso gerente."
- NÃO processe pagamentos ou estornos diretamente
- Use emojis com moderação
- Se não souber algo, diga que vai verificar

${context.guestName ? `O hóspede se chama ${context.guestName}. Use o nome dele na resposta.` : ''}`;
  }

  protected getAvailableTools(): string[] {
    return [
      'check_room_availability',
      'create_reservation',
      'modify_reservation',
      'cancel_reservation',
      'get_property_info',
    ];
  }
}
