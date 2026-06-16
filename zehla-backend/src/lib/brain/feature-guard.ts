import { Plan } from '@/domain/property/enums';

export type Feature = 
  | 'IA_PERSONA' 
  | 'SUPPLIER_MANAGEMENT' 
  | 'ADVANCED_REPORTS' 
  | 'WHATSAPP_LEARNING' 
  | 'COMMISSION_DISCOUNT';

const PLAN_FEATURES: Record<Plan, Feature[]> = {
  FREE: [],
  LITE: ['COMMISSION_DISCOUNT'],
  PRO: ['COMMISSION_DISCOUNT', 'IA_PERSONA', 'WHATSAPP_LEARNING', 'ADVANCED_REPORTS'],
  MAX: ['COMMISSION_DISCOUNT', 'IA_PERSONA', 'WHATSAPP_LEARNING', 'ADVANCED_REPORTS', 'SUPPLIER_MANAGEMENT'],
  BETA_TESTER: ['COMMISSION_DISCOUNT', 'IA_PERSONA', 'WHATSAPP_LEARNING', 'ADVANCED_REPORTS', 'SUPPLIER_MANAGEMENT'],
  EARLY_ADOPTER: ['COMMISSION_DISCOUNT', 'IA_PERSONA', 'WHATSAPP_LEARNING'],
};

export function hasFeature(plan: Plan, feature: Feature): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}

export function getPlanName(plan: Plan): string {
  const names: Record<Plan, string> = {
    FREE: 'ZEHLA Free',
    LITE: 'ZEHLA Lite',
    PRO: 'ZEHLA Pro',
    MAX: 'ZEHLA Max',
    BETA_TESTER: 'ZEHLA Beta',
    EARLY_ADOPTER: 'ZEHLA Early Adopter',
  };
  return names[plan];
}
