import type { PlanType, PlanPricing } from './types';

const PLAN_PRICES: Record<PlanType, PlanPricing> = {
  FREE:  { monthly: 0,   label: 'R$ 0',              annual: 0 },
  LITE:  { monthly: 248, label: 'R$ 248/mês — Taxa Zero', annual: 248 * 12 },
  PRO:   { monthly: 448, label: 'R$ 448/mês — Taxa Zero', annual: 448 * 12 },
  MAX:   { monthly: 798, label: 'R$ 798/mês — Taxa Zero', annual: 798 * 12 },
};

export function getPlanPrice(plan: PlanType): PlanPricing {
  return PLAN_PRICES[plan];
}

export function formatPlanPrice(plan: PlanType): string {
  return PLAN_PRICES[plan].label;
}

export function getAnnualCost(plan: PlanType): number {
  return PLAN_PRICES[plan].annual;
}

export function getMonthlyPrice(plan: PlanType): number {
  return PLAN_PRICES[plan].monthly;
}

export function getAllPlanPrices(): Record<PlanType, PlanPricing> {
  return { ...PLAN_PRICES };
}

export const TRIAL_DAYS = 7;
export const TRIAL_LABEL = '7 dias grátis';
