import { Plan } from '@prisma/client';

export interface FeeBreakdown {
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  percentage: number;
}

/**
 * REGRA DE NEGÓCIO ZEHLA (TABELA OFICIAL):
 * 1. LITE: R$ 248/mês + 5% (Comissão)
 * 2. PRO: R$ 448/mês + 2% (Comissão)
 * 3. MAX: R$ 798/mês + 0% (TAXA ZERO)
 * 
 * FLUXO:
 * - Hóspede -> Dono: Pagamento Integral via PIX (À VISTA).
 * - Dono -> ZEHLA: Débito Automático da comissão no Cartão (À VISTA / IMEDIATO).
 */
const PLAN_FEES: Record<Plan, { commission: number; monthly: number }> = {
  LITE: { commission: 0.05, monthly: 248 },
  PRO: { commission: 0.02, monthly: 448 },
  MAX: { commission: 0.00, monthly: 798 },
  BETA_TESTER: { commission: 0.00, monthly: 0 },
  EARLY_ADOPTER: { commission: 0.01, monthly: 197 },
};

export function calculateFees(finalTotalAmount: number, plan: Plan): FeeBreakdown {
  const { commission } = PLAN_FEES[plan];
  
  // Débito imediato no cartão do dono sobre o valor bruto da reserva
  const platformFee = finalTotalAmount * commission;
  const netAmount = finalTotalAmount - platformFee;

  return {
    grossAmount: finalTotalAmount,
    platformFee,
    netAmount,
    percentage: commission * 100
  };
}

export function getPlanMonthlyPrice(plan: Plan): number {
  return PLAN_FEES[plan].monthly;
}
