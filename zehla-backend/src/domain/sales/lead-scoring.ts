import type { PlanTier, PlanType } from '@/domain/plan/types';
import { getPlanConfig } from '@/domain/plan/entitlements';

export interface ScoredLead {
  score: number;
  tier: PlanTier;
  recommendedPlan: PlanType;
  confidence: number;
  reasons: string[];
}

export function scoreLead(profile: {
  roomsCount?: number | null;
  state?: string | null;
  currentTier?: string | null;
  painPoints?: string | null;
  buyingBehavior?: string | null;
}): ScoredLead {
  const rooms = profile.roomsCount ?? 0;
  const currentTier = (profile.currentTier as PlanTier) ?? 'COLD';
  
  let score = 0;
  const reasons: string[] = [];
  
  // Room count scoring (0-40 points)
  if (rooms >= 30) {
    score += 40;
    reasons.push('30+ quartos (alto potencial)');
  } else if (rooms >= 20) {
    score += 30;
    reasons.push('20-29 quartos (médio-alto potencial)');
  } else if (rooms >= 10) {
    score += 20;
    reasons.push('10-19 quartos (médio potencial)');
  } else if (rooms >= 5) {
    score += 10;
    reasons.push('5-9 quartos (baixo-médio potencial)');
  } else {
    score += 5;
    reasons.push('Menos de 5 quartos (baixo potencial)');
  }
  
  // Current tier scoring (0-30 points)
  switch (currentTier) {
    case 'HOT':
      score += 30;
      reasons.push('Lead já classificado como HOT');
      break;
    case 'WARM':
      score += 20;
      reasons.push('Lead já classificado como WARM');
      break;
    case 'WARM_LOW':
      score += 15;
      reasons.push('Lead já classificado como WARM_LOW');
      break;
    case 'COLD':
      score += 5;
      reasons.push('Lead ainda está frio');
      break;
    case 'DEAD':
      score += 0;
      reasons.push('Lead inativo');
      break;
  }
  
  // Pain points scoring (0-20 points)
  const painPoints = profile.painPoints ?? '';
  if (painPoints.includes('taxa') || painPoints.includes('comissão')) {
    score += 10;
    reasons.push('Dor relacionada a taxas/comissões');
  }
  if (painPoints.includes('ota') || painPoints.includes('booking') || painPoints.includes('airbnb')) {
    score += 10;
    reasons.push('Dor relacionada a dependência de OTAs');
  }
  
  // Buying behavior scoring (0-10 points)
  const buyingBehavior = profile.buyingBehavior ?? '';
  if (buyingBehavior === 'Inovador') {
    score += 10;
    reasons.push('Perfil de comprador inovador');
  } else if (buyingBehavior === 'Sob-Pressão') {
    score += 5;
    reasons.push('Perfil de comprador sob pressão');
  }
  
  // Determine tier based on score
  let tier: PlanTier;
  if (score >= 80) {
    tier = 'HOT';
  } else if (score >= 60) {
    tier = 'WARM';
  } else if (score >= 40) {
    tier = 'WARM_LOW';
  } else if (score >= 20) {
    tier = 'COLD';
  } else {
    tier = 'DEAD';
  }
  
  // Recommend plan based on score and rooms
  let recommendedPlan: PlanType;
  let confidence: number;
  
  if (score >= 80 || rooms >= 30) {
    recommendedPlan = 'MAX';
    confidence = 0.85 + (score - 80) * 0.0025; // 0.85 to 0.95
  } else if (score >= 60 || rooms >= 15) {
    recommendedPlan = 'PRO';
    confidence = 0.80 + (score - 60) * 0.0025; // 0.80 to 0.90
  } else {
    recommendedPlan = 'LITE';
    confidence = 0.90 - (score * 0.001); // 0.90 to 0.70
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.5, Math.min(0.95, confidence));
  
  return {
    score,
    tier,
    recommendedPlan,
    confidence,
    reasons,
  };
}
