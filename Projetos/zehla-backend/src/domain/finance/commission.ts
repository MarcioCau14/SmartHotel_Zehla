import type { PlanType } from '../plan/types';

/**
 * POLÍTICA DE COMISSÃO ZEHLA (Maio/2026)
 *
 * Comercial pillar: Assinatura 100% Fixa — Taxa Zero / Sem Comissões
 * - FREE:   5% sobre reservas diretas (via perfil público / linktree)
 * - LITE:   0% (TAXA ZERO)
 * - PRO:    0% (TAXA ZERO)
 * - MAX:    0% (TAXA ZERO)
 *
 * Reservas originadas de OTAs (Booking, Airbnb): R$ 0,00 de taxa em qualquer plano.
 */

const COMMISSION_RATES: Record<PlanType, number> = {
  FREE: 0.05,
  LITE: 0,
  PRO:  0,
  MAX:  0,
};

export interface CommissionResult {
  grossAmount: number;
  commissionAmount: number;
  commissionRate: number;
  netAmount: number;
  isTaxaZero: boolean;
}

export function getCommissionRate(plan: PlanType): number {
  return COMMISSION_RATES[plan];
}

export function isTaxaZero(plan: PlanType): boolean {
  return COMMISSION_RATES[plan] === 0;
}

export function calculateCommission(
  amount: number,
  plan: PlanType,
  source: 'OTA' | 'DIRECT' = 'DIRECT'
): CommissionResult {
  if (source === 'OTA') {
    return {
      grossAmount: amount,
      commissionAmount: 0,
      commissionRate: 0,
      netAmount: amount,
      isTaxaZero: true,
    };
  }

  const rate = COMMISSION_RATES[plan];
  const commission = amount * rate;

  return {
    grossAmount: amount,
    commissionAmount: commission,
    commissionRate: rate,
    netAmount: amount - commission,
    isTaxaZero: rate === 0,
  };
}
