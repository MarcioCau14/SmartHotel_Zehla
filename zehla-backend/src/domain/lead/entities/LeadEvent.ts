import { Result } from '../../shared/Result'
import { DomainEvent } from '../../shared/DomainEvent'
import { LeadEventType } from '../LeadEventType'
import crypto from 'crypto'

export interface LeadEventData {
  id: string
  leadId: string
  type: LeadEventType
  scoreImpact: number
  dedupHash?: string
  sessionId?: string
  fingerprint?: string
  eventSource?: string
  metadata?: Record<string, unknown>
  timestamp: Date
}

export class LeadEvent {
  private _events: DomainEvent[] = []

  private constructor(private data: LeadEventData) {}

  static create(props: {
    id: string
    leadId: string
    type: LeadEventType
    sessionId?: string
    fingerprint?: string
    eventSource?: string
    metadata?: Record<string, unknown>
  }): Result<LeadEvent, string> {
    const scoreImpact = this.getScoreImpact(props.type)
    const rawForHash = `${props.leadId}:${props.type}:${props.sessionId ?? ''}:${Date.now()}`
    const dedupHash = crypto.createHash('sha256').update(rawForHash).digest('hex')

    return Result.ok(
      new LeadEvent({
        id: props.id,
        leadId: props.leadId,
        type: props.type,
        scoreImpact,
        dedupHash,
        sessionId: props.sessionId,
        fingerprint: props.fingerprint,
        eventSource: props.eventSource ?? 'api',
        metadata: props.metadata,
        timestamp: new Date(),
      })
    )
  }

  private static getScoreImpact(type: LeadEventType): number {
    const impacts: Partial<Record<LeadEventType, number>> = {
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
    return impacts[type] ?? 0
  }

  get id(): string { return this.data.id }
  get leadId(): string { return this.data.leadId }
  get type(): LeadEventType { return this.data.type }
  get scoreImpact(): number { return this.data.scoreImpact }
  get dedupHash(): string | undefined { return this.data.dedupHash }
  get sessionId(): string | undefined { return this.data.sessionId }
  get timestamp(): Date { return this.data.timestamp }
  get events(): DomainEvent[] { return [...this._events] }

  toJSON() {
    return {
      id: this.data.id,
      leadId: this.data.leadId,
      type: this.data.type,
      scoreImpact: this.data.scoreImpact,
      timestamp: this.data.timestamp.toISOString(),
    }
  }
}
