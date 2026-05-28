import { DomainEvent } from '../../shared/DomainEvent'

export class CheckInDoneEvent implements DomainEvent {
  public readonly eventName = 'CheckInDone'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      propertyId: string
      roomId: string
      guestName: string
      code: string
    }
  ) {}
}
