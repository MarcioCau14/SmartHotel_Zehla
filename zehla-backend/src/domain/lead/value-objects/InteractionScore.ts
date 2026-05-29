import { Result } from '../../shared/Result'
import { Cluster, deriveCluster } from '../LeadStatus'
import { LeadEventType } from '../LeadEventType'

const SCORE_IMPACTS: Partial<Record<LeadEventType, number>> = {
  [LeadEventType.EMAIL_OPEN]: 1,
  [LeadEventType.LINK_CLICK]: 5,
  [LeadEventType.LANDING_VISIT]: 3,
  [LeadEventType.WHATSAPP_OPEN]: 2,
  [LeadEventType.WHATSAPP_REPLY]: 10,
  [LeadEventType.WHATSAPP_SENT]: 1,
  [LeadEventType.WHATSAPP_DELIVERED]: 1,
  [LeadEventType.WHATSAPP_LINK_CLICKED]: 8,
  [LeadEventType.AD_VIEW]: 1,
  [LeadEventType.TRIAL_STARTED]: 30,
  [LeadEventType.PAYMENT_MADE]: 20,
  [LeadEventType.CONVERSION]: 50,
}

export interface InteractionScoreProps {
  score: number
}

export class InteractionScore {
  private constructor(
    public readonly score: number
  ) {
    Object.freeze(this)
  }

  static create(props: InteractionScoreProps): Result<InteractionScore, string> {
    if (props.score < 0 || props.score > 100) {
      return Result.fail('InteractionScore deve estar entre 0 e 100')
    }
    return Result.ok(new InteractionScore(props.score))
  }

  get cluster(): Cluster {
    return deriveCluster(this.score)
  }

  static fromEvents(events: { type: LeadEventType }[]): InteractionScore {
    let total = 0
    for (const event of events) {
      total += SCORE_IMPACTS[event.type] ?? 0
    }
    const clamped = Math.max(0, Math.min(100, total))
    return new InteractionScore(clamped)
  }

  static getScoreImpact(eventType: LeadEventType): number {
    return SCORE_IMPACTS[eventType] ?? 0
  }

  toJSON() {
    return { score: this.score, cluster: this.cluster }
  }
}
