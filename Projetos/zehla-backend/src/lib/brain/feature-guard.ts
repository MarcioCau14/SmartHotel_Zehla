import { Plan } from '@prisma/client';


export type Feature = 
  | 'IA_PERSONA' 
  | 'SUPPLIER_MANAGEMENT' 
  | 'ADVANCED_REPORTS' 
  | 'WHATSAPP_LEARNING' 
  | 'COMMISSION_DISCOUNT';

const PLAN_FEATURES: Record<Plan, Feature[]> = {
  LITE: ['COMMISSION_DISCOUNT'],
  PRO: ['COMMISSION_DISCOUNT', 'IA_PERSONA', 'WHATSAPP_LEARNING', 'ADVANCED_REPORTS'],
  MAX: ['COMMISSION_DISCOUNT', 'IA_PERSONA', 'WHATSAPP_LEARNING', 'ADVANCED_REPORTS', 'SUPPLIER_MANAGEMENT'],
};

export function hasFeature(plan: Plan, feature: Feature): boolean {
  try {
  return PLAN_FEATURES[plan].includes(feature);
}

export function getPlanName(plan: Plan): string {
  try {
  const names: Record<Plan, string> = {
    LITE: 'ZEHLA Lite',
    PRO: 'ZEHLA Pro',
    MAX: 'ZEHLA Max',
  };
  return names[plan];
}
