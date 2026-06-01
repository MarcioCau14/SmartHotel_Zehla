// src/lib/sales/recommend-plan.ts
// ZEHLA Sales Intelligence — Plan Recommendation Engine
// Connected to Funnel Intelligence from secretaria-ai

export interface LeadProfile {
  roomsCount?: number | null;
  state?: string | null;
  leadTier?: string | null;
  painPoints?: string | null;
  buyingBehavior?: string | null;
}

export interface PlanRecommendation {
  recommendedPlan: 'LITE' | 'PRO' | 'MAX';
  confidence: number;
  reason: string;
  alternativePlan?: 'PRO' | 'MAX';
  alternativeReason?: string;
  pitchVariant: 'financeira' | 'operacional' | 'ocupacao';
}

export function recommendPlan(profile: LeadProfile): PlanRecommendation {
  const rooms = profile.roomsCount ?? 0;
  const tier = profile.leadTier ?? 'COLD';

  // MAX: 30+ quartos, ou múltiplas propriedades, ou alta maturidade
  if (rooms >= 30 || tier === 'HOT') {
    return {
      recommendedPlan: 'MAX',
      confidence: 0.85,
      reason: `Pousada com ${rooms} quartos tem perfil ideal para o plano MAX. Taxa zero em todas as reservas.`,
      alternativePlan: 'PRO',
      alternativeReason: 'Se preferir começar menor, o PRO oferece precificação inteligente.',
      pitchVariant: 'financeira',
    };
  }

  // PRO: 15-29 quartos, ou maturidade média
  if (rooms >= 15 || tier === 'WARM') {
    return {
      recommendedPlan: 'PRO',
      confidence: 0.8,
      reason: `Pousada com ${rooms} quartos maximiza lucro com precificação inteligente do PRO.`,
      alternativePlan: 'MAX',
      alternativeReason: 'Para crescer sem limites, o MAX elimina toda taxa variável.',
      pitchVariant: 'ocupacao',
    };
  }

  // LITE: 5-14 quartos
  return {
    recommendedPlan: 'LITE',
    confidence: 0.9,
    reason: `Pousada com ${rooms} quartos começa perfeitamente com o plano LITE.`,
    alternativePlan: 'PRO',
    alternativeReason: 'Para precificação automática, upgrade para PRO é o caminho.',
    pitchVariant: 'operacional',
  };
}

export function formatPricing(plan: string): { monthly: number; label: string } {
  switch (plan) {
    case 'LITE':
      return { monthly: 248, label: 'R$ 248/mês — Taxa Zero' };
    case 'PRO':
      return { monthly: 448, label: 'R$ 448/mês — Taxa Zero' };
    case 'MAX':
      return { monthly: 798, label: 'R$ 798/mês — Taxa Zero' };
    default:
      return { monthly: 0, label: 'Sob consulta' };
  }
}

export function calculateROI(
  plan: string,
  rooms: number,
  avgDailyRate: number,
  monthlyDirectBookings: number
): { monthlySavings: number; yearlySavings: number; roiDays: number } {
  const commissionRate = 0.15; // 15% OTA commission average
  const avgCommissionPerBooking = avgDailyRate * commissionRate;
  const monthlyCommission = monthlyDirectBookings * avgCommissionPerBooking;
  const planCost = formatPricing(plan).monthly;

  const monthlySavings = monthlyCommission - planCost;
  const yearlySavings = monthlySavings * 12;
  const roiDays = planCost > 0 ? Math.ceil((planCost / (monthlyCommission || 1)) * 30) : 0;

  return {
    monthlySavings: Math.max(0, monthlySavings),
    yearlySavings: Math.max(0, yearlySavings),
    roiDays,
  };
}
