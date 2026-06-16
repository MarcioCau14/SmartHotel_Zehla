export enum LeadStatus {
  PROSPECT = 'PROSPECT',
  QUALIFIED = 'QUALIFIED',
  TRIAL = 'TRIAL',
  NEGOTIATION = 'NEGOTIATION',
  CONVERTED = 'CONVERTED',
  CHURNED = 'CHURNED',
  REACTIVATED = 'REACTIVATED',
  BLACKLISTED = 'BLACKLISTED',
}

const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  [LeadStatus.PROSPECT]: [LeadStatus.QUALIFIED, LeadStatus.BLACKLISTED],
  [LeadStatus.QUALIFIED]: [LeadStatus.TRIAL, LeadStatus.NEGOTIATION, LeadStatus.CHURNED, LeadStatus.BLACKLISTED],
  [LeadStatus.TRIAL]: [LeadStatus.NEGOTIATION, LeadStatus.CONVERTED, LeadStatus.CHURNED, LeadStatus.BLACKLISTED],
  [LeadStatus.NEGOTIATION]: [LeadStatus.CONVERTED, LeadStatus.CHURNED, LeadStatus.BLACKLISTED],
  [LeadStatus.CONVERTED]: [LeadStatus.CHURNED],
  [LeadStatus.CHURNED]: [LeadStatus.REACTIVATED],
  [LeadStatus.REACTIVATED]: [LeadStatus.QUALIFIED, LeadStatus.CHURNED, LeadStatus.BLACKLISTED],
  [LeadStatus.BLACKLISTED]: [],
}

export function canTransitionLeadStatus(
  current: LeadStatus,
  target: LeadStatus
): boolean {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false
}

export type FunnelStage =
  | 'NEUTRAL'
  | 'AWARE'
  | 'INTERESTED'
  | 'ENGAGED'
  | 'TRIAL'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'CHURNED'
  | 'REACTIVATED'

const FUNNEL_ORDER: Record<FunnelStage, number> = {
  NEUTRAL: 0,
  AWARE: 1,
  INTERESTED: 2,
  ENGAGED: 3,
  TRIAL: 4,
  NEGOTIATION: 5,
  CONVERTED: 6,
  CHURNED: 7,
  REACTIVATED: 1,
}

export function canTransitionFunnelStage(
  current: FunnelStage,
  target: FunnelStage
): boolean {
  if (target === 'REACTIVATED') return current === 'CHURNED'
  return FUNNEL_ORDER[target] >= FUNNEL_ORDER[current]
}

export type Cluster = 'HOT' | 'WARM' | 'COLD'

export function deriveCluster(score: number): Cluster {
  if (score >= 60) return 'HOT'
  if (score >= 30) return 'WARM'
  return 'COLD'
}

export type BehaviorProfile =
  | 'analítico'
  | 'urgente'
  | 'curioso'
  | 'resistente'
  | 'conservador'
