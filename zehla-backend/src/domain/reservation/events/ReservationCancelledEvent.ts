import { DomainEvent } from '../../shared/DomainEvent'

export class ReservationCancelledEvent implements DomainEvent {
  public readonly eventName = 'ReservationCancelled'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      propertyId: string
      roomId: string
      code: string
    }
  ) {}
}
