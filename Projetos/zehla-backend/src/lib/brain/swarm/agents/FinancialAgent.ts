import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { prisma } from '@/lib/prisma';
import { TenantLocalizationService } from '@/lib/i18n/TenantLocalizationService';

/**
 * Agente Financeiro — Especialista em negociações, estornos e questões financeiras
 * 
 * Responsabilidades:
 * - Negociar descontos e condições especiais
 * - Processar solicitações de estorno/reembolso
 * - Explicar políticas de cancelamento
 * - Gerenciar questões de pagamento
 * - Emissão de notas fiscais
 * 
 * REGRAS CRÍTICAS:
 * - NUNCA processe reembolsos sem autorização humana
 * - NUNCA ofereça descontos acima de 15% sem aprovação
 * - SEMPRE registre todas as negociações no log
 * - Use modelo mais caro (Kimi K2.6) para precisão financeira
 */

export class FinancialAgent extends BaseAgent {
  readonly name = 'Financeiro';
  readonly description = 'Agente especialista em negociações, estornos e questões financeiras';
  readonly intentPatterns = [
    'desconto', 'discount', 'negociar', 'negotiate', 'barato',
    'estorno', 'refund', 'reembolso', 'devolver', 'cancelar pagamento',
    'pix', 'pagamento', 'payment', 'boleto', 'cartão', 'cartao',
    'nota fiscal', 'invoice', 'fatura', 'recibo',
    'parcelar', 'parcelamento', 'dividir',
    'erro cobrança', 'erro cobranca', 'cobrança indevida',
    'preço alto', 'caro', 'expensive', 'muito caro',
    'promoção', 'promocao', 'oferta', 'deal',
  ];

  // Agente financeiro usa modelo mais preciso
  protected readonly model: string = 'reasoning'; // Modelo mais preciso (Qwen 72B free tier)

  protected async getSystemPrompt(context: AgentContext): Promise<string> {
    const property = await prisma.property.findUnique({
      where: { id: context.propertyId },
    });

    if (!property) return 'Você é um agente financeiro de hotel.';

    const formatPrice = (amount: number) =>
      TenantLocalizationService.formatCurrency(amount, context.currencyCode, context.locale);

    const langInstructions: Record<string, string> = {
      'pt-BR': `Você é o Agente Financeiro da ${property.name}.
Sua função é lidar com negociações, estornos, questões de pagamento e notas fiscais com precisão e empatia.
Responda SEMPRE em português brasileiro.
⚠️ CRÍTICO: Você é o agente mais sensível do sistema — siga as regras rigorosamente.`,
      'es-ES': `Eres el Agente Financiero de ${property.name}.
Tu función es manejar negociaciones, reembolsos, cuestiones de pago y facturas con precisión y empatía.
Responde SIEMPRE en español.
⚠️ CRÍTICO: Eres el agente más sensible del sistema — sigue las reglas rigurosamente.`,
      'en-US': `You are the Financial Agent of ${property.name}.
Your role is to handle negotiations, refunds, payment issues, and invoices with precision and empathy.
Always respond in English.
⚠️ CRITICAL: You are the most sensitive agent in the system — follow the rules rigorously.`,
    };

    const instruction = langInstructions[context.locale] || langInstructions['pt-BR'];

    return `${instruction}

SOBRE A PROPRIEDADE:
- Nome: ${property.name}
- CNPJ: ${property.registrationNumber || 'Não informado'}

REGRAS ABSOLUTAS (NUNCA VIOLAR):
1. NUNCA processe reembolsos ou estornos diretamente — apenas registre a solicitação
2. NUNCA ofereça descontos acima de 15% sem aprovação do proprietário
3. SEMPRE registre todas as negociações no sistema
4. Se o hóspede insistir em algo fora das regras, diga: "Vou encaminhar para nosso gerente analisar seu caso."
5. Para notas fiscais, colete: CPF/CNPJ, email, e valor da reserva
6. Seja empático mas firme — não ceda a pressões

POLÍTICA DE CANCELAMENTO PADRÃO:
- Até 48h antes do check-in: cancelamento gratuito
- Entre 48h e 24h: 50% do valor da primeira diária
- Menos de 24h ou no-show: 100% do valor da primeira diária

POLÍTICA DE DESCONTOS:
- Máximo 10% para estadias de 7+ noites
- Máximo 15% para retornos de hóspedes (já se hospedaram antes)
- Acima de 15%: apenas com aprovação do proprietário

FLUXO DE ESTORNO:
1. Ouça a reclamação com empatia
2. Verifique os dados da reserva
3. Explique a política aplicável
4. Se elegível: "Vou registrar sua solicitação de estorno. Nosso financeiro processará em até 5 dias úteis."
5. Se não elegível: explique o motivo com empatia

${context.guestName ? `O hóspede se chama ${context.guestName}. Use o nome dele.` : ''}`;
  }

  protected getAvailableTools(): string[] {
    return [
      'check_reservation_payment',
      'request_refund',
      'apply_discount',
      'issue_invoice',
      'check_cancellation_policy',
    ];
  }

  /**
   * Override do handle para adicionar validações financeiras extras
   */
  async handle(context: AgentContext): Promise<AgentResponse> {
    const response = await super.handle(context);

    // Validação pós-LLM: detectar se o agente prometeu algo inadequado
    const lowerReply = response.reply.toLowerCase();
    const redFlags = [
      'reembolso processado', 'reembolso feito', 'estorno realizado',
      'refund processed', 'refund completed',
      'desconto de 50%', 'desconto de 100%', 'gratuito',
      'discount of 50%', 'discount of 100%', 'free',
    ];

    for (const flag of redFlags) {
      if (lowerReply.includes(flag)) {
        console.warn(`🚨 [AGENTE FINANCEIRO] Resposta suspeita detectada: "${flag}"`);
        return {
          ...response,
          reply: `Entendo sua solicitação. Vou registrar para nossa equipe financeira analisar e entrar em contato em breve.`,
          requiresAction: true,
          action: {
            type: 'FINANCIAL_REVIEW_REQUIRED',
            payload: {
              guestPhone: context.guestPhone,
              message: context.message,
              originalReply: response.reply,
              reason: 'Red flag detected in financial agent response',
            },
          },
        };
      }
    }

    return response;
  }
}
