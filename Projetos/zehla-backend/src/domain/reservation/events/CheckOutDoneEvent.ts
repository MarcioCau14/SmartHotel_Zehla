import { DomainEvent } from '../../shared/DomainEvent'

export class CheckOutDoneEvent implements DomainEvent {
  public readonly eventName = 'CheckOutDone'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      propertyId: string
      roomId: string
      totalAmount: number
      code: string
    }
  ) {}
}
