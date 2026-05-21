import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { prisma } from '@/lib/prisma';
import { TenantLocalizationService } from '@/lib/i18n/TenantLocalizationService';

/**
 * Agente Concierge — Especialista em upsells, experiências e recomendações locais
 * 
 * Responsabilidades:
 * - Oferecer serviços adicionais (vinho, travesseiro extra, late checkout)
 * - Recomendar experiências locais (passeios, restaurantes, praias)
 * - Criar pac especiais personalizados
 * - Aumentar o ticket médio por hóspede
 * 
 * NÃO faz:
 * - Reservas básicas (encaminha para ReceptionistAgent)
 * - Negociações financeiras (encaminha para FinancialAgent)
 */

export class ConciergeAgent extends BaseAgent {
  readonly name = 'Concierge';
  readonly description = 'Agente especialista em upsells, experiências e recomendações locais';
  readonly intentPatterns = [
    'passeio', 'tour', 'experiência', 'experiencia', 'atividade',
    'restaurante', 'comida', 'jantar', 'almoço', 'almoco',
    'praia', 'trilha', 'surf', 'mergulho', 'passeio de barco',
    'vinho', 'champagne', 'especial', 'romântico', 'romantico',
    'aniversário', 'aniversario', 'celebrar', 'lua de mel',
    'upgrade', 'melhorar', 'suíte', 'suite', 'vista mar',
    'recomenda', 'sugestão', 'sugestao', 'dica', 'o que fazer',
    'spa', 'massagem', 'relaxar', 'bem-estar',
  ];

  protected async getSystemPrompt(context: AgentContext): Promise<string> {
    const property = await prisma.property.findUnique({
      where: { id: context.propertyId },
      include: {
        rooms: true,
        services: true,
        serviceItems: true,
      },
    });

    if (!property) return 'Você é um concierge de hotel.';

    const formatPrice = (amount: number) =>
      TenantLocalizationService.formatCurrency(amount, context.currencyCode, context.locale);

    const upsellCatalog = (property.serviceItems || [])
      .filter(item => item.isActive)
      .map(item => `- ${item.name}: ${formatPrice(item.price)} (${item.category})`)
      .join('\n') || 'Nenhum serviço adicional disponível no momento.';

    const services = (property.services || [])
      .filter(s => s.isIncluded)
      .map(s => `- ${s.name}${s.price ? ` (${formatPrice(s.price)})` : ' (incluso)'}`)
      .join('\n') || 'Nenhum serviço adicional cadastrado.';

    const langInstructions: Record<string, string> = {
      'pt-BR': `Você é o Concierge IA da ${property.name}.
Sua função é encantar hóspedes com recomendações personalizadas, oferecer experiências memoráveis e aumentar a satisfação (e o ticket médio).
Responda SEMPRE em português brasileiro.
Seja entusiasta, criativo e persuasivo — mas nunca insistente.`,
      'es-ES': `Eres el Concierge IA de ${property.name}.
Tu función es encantar a los huéspedes con recomendaciones personalizadas, ofrecer experiencias memorables y aumentar la satisfacción.
Responde SIEMPRE en español.
Sé entusiasta, creativo y persuasivo — pero nunca insistente.`,
      'en-US': `You are the AI Concierge of ${property.name}.
Your role is to delight guests with personalized recommendations, offer memorable experiences, and increase satisfaction (and average ticket).
Always respond in English.
Be enthusiastic, creative, and persuasive — but never pushy.`,
    };

    const instruction = langInstructions[context.locale] || langInstructions['pt-BR'];

    return `${instruction}

SOBRE A PROPRIEDADE:
- Nome: ${property.name}
- Localização: ${property.city}/${property.state}
${property.description ? `- Descrição: ${property.description}` : ''}

CATÁLOGO DE UPSELLS:
${upsellCatalog}

SERVIÇOS INCLUÍDOS:
${services}

ESTRATÉGIA DE UPSELL:
1. Ouça o que o hóspede deseja
2. Sugira 1-2 experiências relevantes (não sobrecarregue)
3. Mencione o valor de forma natural
4. Se o hóspede demonstrar interesse, ofereça para adicionar à reserva
5. Nunca seja insistente — respeite o "não"

REGRAS:
- Seja entusiasta e criativo
- Use emojis com moderação (máx. 2 por mensagem)
- Mantenha respostas concisas
- Foque em criar experiências memoráveis
- Se não souber algo sobre a região, sugira pesquisar

${context.guestName ? `O hóspede se chama ${context.guestName}. Personalize a resposta.` : ''}`;
  }

  protected getAvailableTools(): string[] {
    return [
      'get_service_items',
      'add_service_to_reservation',
      'get_local_recommendations',
      'create_experience_package',
    ];
  }
}
