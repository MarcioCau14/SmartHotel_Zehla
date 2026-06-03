export type FollowUpCadence = 'ENGAJAMENTO' | 'URGENCIA' | 'FECHAMENTO'

export const FOLLOW_UP_INTERVALS_MS: Record<FollowUpCadence, number> = {
  ENGAJAMENTO: 2 * 60 * 60 * 1000,
  URGENCIA: 24 * 60 * 60 * 1000,
  FECHAMENTO: 48 * 60 * 60 * 1000,
}

export const FOLLOW_UP_ORDER: FollowUpCadence[] = ['ENGAJAMENTO', 'URGENCIA', 'FECHAMENTO']
