export enum LeadStatus {
  PROSPECT = 'PROSPECT',
  QUALIFIED = 'QUALIFIED',
  TRIAL_STARTED = 'TRIAL_STARTED',
  CONVERTED = 'CONVERTED',
  BLACKLISTED = 'BLACKLISTED',
}

const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  [LeadStatus.PROSPECT]: [LeadStatus.QUALIFIED, LeadStatus.BLACKLISTED],
  [LeadStatus.QUALIFIED]: [LeadStatus.TRIAL_STARTED, LeadStatus.BLACKLISTED],
  [LeadStatus.TRIAL_STARTED]: [LeadStatus.CONVERTED, LeadStatus.BLACKLISTED],
  [LeadStatus.CONVERTED]: [],
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
  | 'CONVERTED'

const FUNNEL_ORDER: Record<FunnelStage, number> = {
  NEUTRAL: 0,
  AWARE: 1,
  INTERESTED: 2,
  ENGAGED: 3,
  TRIAL: 4,
  CONVERTED: 5,
}

export function canTransitionFunnelStage(
  current: FunnelStage,
  target: FunnelStage
): boolean {
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
