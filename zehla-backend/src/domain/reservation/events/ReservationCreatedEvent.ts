import { DomainEvent } from '../../shared/DomainEvent'

export class ReservationCreatedEvent implements DomainEvent {
  public readonly eventName = 'ReservationCreated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      propertyId: string
      roomId: string
      guestPhone: string
      checkIn: string
      checkOut: string
      totalAmount: number
      code: string
    }
  ) {}
}
