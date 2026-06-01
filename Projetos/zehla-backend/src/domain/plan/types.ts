export type PlanType = 'FREE' | 'LITE' | 'PRO' | 'MAX';
export type PlanTier = 'COLD' | 'WARM' | 'HOT' | 'WARM_LOW' | 'DEAD';

export interface PlanConfig {
  name: PlanType;
  monthlyPrice: number;
  commissionRate: number;
  aiMessagesLimit: number | 'ilimitado';
  maxRooms: number | 'ilimitado';
  supportsSmartPricing: boolean;
  supportsSalesRecovery: boolean;
  supportsMultiHotel: boolean;
  supportLevel: 'comunidade' | 'email' | 'whatsapp_vip' | 'engenharia';
  reportLevel: 'basico' | 'avancado' | 'profissional';
  trialDays: number;
}

export interface PlanPricing {
  monthly: number;
  label: string;
  annual: number;
}

export interface UpgradePath {
  from: PlanType;
  to: PlanType;
  allowed: boolean;
  requiresConsultation: boolean;
}
