import type { PlanType, PlanConfig } from './types';

const PLAN_ENTITLEMENTS: Record<PlanType, PlanConfig> = {
  FREE: {
    name: 'FREE',
    monthlyPrice: 0,
    commissionRate: 0.05,
    aiMessagesLimit: 50,
    maxRooms: 5,
    supportsSmartPricing: false,
    supportsSalesRecovery: false,
    supportsMultiHotel: false,
    supportLevel: 'comunidade',
    reportLevel: 'basico',
    trialDays: 0,
  },
  LITE: {
    name: 'LITE',
    monthlyPrice: 248,
    commissionRate: 0,
    aiMessagesLimit: 'ilimitado',
    maxRooms: 10,
    supportsSmartPricing: false,
    supportsSalesRecovery: false,
    supportsMultiHotel: false,
    supportLevel: 'email',
    reportLevel: 'basico',
    trialDays: 7,
  },
  PRO: {
    name: 'PRO',
    monthlyPrice: 448,
    commissionRate: 0,
    aiMessagesLimit: 'ilimitado',
    maxRooms: 29,
    supportsSmartPricing: true,
    supportsSalesRecovery: true,
    supportsMultiHotel: false,
    supportLevel: 'whatsapp_vip',
    reportLevel: 'avancado',
    trialDays: 7,
  },
  MAX: {
    name: 'MAX',
    monthlyPrice: 798,
    commissionRate: 0,
    aiMessagesLimit: 'ilimitado',
    maxRooms: 'ilimitado',
    supportsSmartPricing: true,
    supportsSalesRecovery: true,
    supportsMultiHotel: true,
    supportLevel: 'engenharia',
    reportLevel: 'profissional',
    trialDays: 7,
  },
};

export function getPlanConfig(plan: PlanType): PlanConfig {
  return PLAN_ENTITLEMENTS[plan];
}

export function getAIMessageLimit(plan: PlanType): number | 'ilimitado' {
  return PLAN_ENTITLEMENTS[plan].aiMessagesLimit;
}

export function getMaxRooms(plan: PlanType): number | 'ilimitado' {
  return PLAN_ENTITLEMENTS[plan].maxRooms;
}

export function getSupportLevel(plan: PlanType): PlanConfig['supportLevel'] {
  return PLAN_ENTITLEMENTS[plan].supportLevel;
}

export function getAllPlanConfigs(): Record<PlanType, PlanConfig> {
  return { ...PLAN_ENTITLEMENTS };
}

export function getPlansWithTaxaZero(): PlanType[] {
  return (Object.entries(PLAN_ENTITLEMENTS) as [PlanType, PlanConfig][])
    .filter(([_, config]) => config.commissionRate === 0)
    .map(([plan]) => plan);
}

export function getPlansWithTrial(): PlanType[] {
  return (Object.entries(PLAN_ENTITLEMENTS) as [PlanType, PlanConfig][])
    .filter(([_, config]) => config.trialDays > 0)
    .map(([plan]) => plan);
}
