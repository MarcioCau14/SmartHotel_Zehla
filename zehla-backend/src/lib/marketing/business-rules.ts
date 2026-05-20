/**
 * ZEHLA BUSINESS RULES (Anti-Double Commission)
 * Versão: 2.5 (Maio/2026)
 */

export const ZEHLA_PLANS = {
  LITE: {
    price: 248,
    commission: 0.05, // 5% apenas em conversão direta
    supportsOTAFee: false,
  },
  PRO: {
    price: 498,
    commission: 0.02, // 2% apenas em conversão direta
    supportsOTAFee: false,
  },
  MAX: {
    price: 798,
    commission: 0, // Taxa Zero Absoluta
    supportsOTAFee: true,
  },
};

/**
 * LÓGICA DE COBRANÇA (O CORAÇÃO DO SISTEMA)
 * 1. Se a reserva tem origem 'OTA' (Booking, AirBnB): ZEHLA cobra R$ 0,00 de taxa.
 * 2. Se a reserva tem origem 'DIRECT' (WhatsApp/Zehla link): ZEHLA cobra a % do plano.
 * 3. Suporte ao hóspede 24h: Sempre incluso na mensalidade fixa.
 */
export function calculateCommission(amount: number, source: 'OTA' | 'DIRECT', plan: keyof typeof ZEHLA_PLANS) {
  if (source === 'OTA') return 0;
  if (plan === 'MAX') return 0;
  
  return amount * ZEHLA_PLANS[plan].commission;
}

/**
 * AGENT GUIDELINES (Para o Brain / Secretaria-IA)
 * - Identificar hóspedes de OTAs no início da conversa.
 * - Priorizar o suporte e hospitalidade para hóspedes de OTAs sem tentar revender a estadia.
 * - Atuar como 'Time Saver' para o hoteleiro.
 */
