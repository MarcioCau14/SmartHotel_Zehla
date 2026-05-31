import type { PlanType, UpgradePath } from './types';

const UPGRADE_PATHS: UpgradePath[] = [
  { from: 'FREE', to: 'LITE', allowed: true, requiresConsultation: false },
  { from: 'FREE', to: 'PRO',  allowed: true, requiresConsultation: false },
  { from: 'FREE', to: 'MAX',  allowed: true, requiresConsultation: true },
  { from: 'LITE', to: 'PRO',  allowed: true, requiresConsultation: false },
  { from: 'LITE', to: 'MAX',  allowed: true, requiresConsultation: true },
  { from: 'PRO',  to: 'MAX',  allowed: true, requiresConsultation: false },
];

export function canUpgrade(from: PlanType, to: PlanType): boolean {
  return UPGRADE_PATHS.some(p => p.from === from && p.to === to && p.allowed);
}

export function getUpgradePath(from: PlanType, to: PlanType): UpgradePath | undefined {
  return UPGRADE_PATHS.find(p => p.from === from && p.to === to);
}

export function getNextPlan(current: PlanType): PlanType | null {
  const order: PlanType[] = ['FREE', 'LITE', 'PRO', 'MAX'];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

export function getAvailableUpgrades(from: PlanType): UpgradePath[] {
  return UPGRADE_PATHS.filter(p => p.from === from && p.allowed);
}

export function getUpsellTitle(from: PlanType, to: PlanType): string {
  const messages: Record<string, string> = {
    'FREE-LITE': 'Quer atendimento ilimitado 24h?',
    'FREE-PRO': 'Quer inteligência de preços desde o início?',
    'FREE-MAX': 'Quer a solução completa para sua pousada?',
    'LITE-PRO': 'Quer aumentar seu lucro com Preços Inteligentes?',
    'LITE-MAX': 'Quer escalar sem limites?',
    'PRO-MAX': 'Quer crescer sem pagar taxas por reserva?',
  };
  return messages[`${from}-${to}`] || 'Faça upgrade do seu plano';
}
