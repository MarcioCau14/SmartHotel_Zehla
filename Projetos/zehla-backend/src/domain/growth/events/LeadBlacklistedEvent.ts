import { DomainEvent } from '../../shared/DomainEvent'

export class LeadBlacklistedEvent implements DomainEvent {
  public readonly eventName = 'LeadBlacklistedEvent'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string, // leadId
    public readonly payload: {
      leadId: string
      email?: string | null
      phone?: string | null
      whatsapp?: string | null
    }
  ) {}
}
