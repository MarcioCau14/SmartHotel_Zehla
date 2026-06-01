import { DomainEvent } from '../../shared/DomainEvent'

export class PaymentLinkedEvent implements DomainEvent {
  public readonly eventName = 'PaymentLinked'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      paymentId: string
      amount: number
      method: string
    }
  ) {}
}
