import { DomainEvent } from '../shared/DomainEvent'
import { InvoiceStatus, PaymentStatus, PaymentMethod, PixStatus } from './enums'

export class InvoiceCreatedEvent implements DomainEvent {
  public readonly eventName = 'InvoiceCreated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      invoiceNumber: string
      guestId: string
      reservationId: string
    }
  ) {}
}

export class InvoiceIssuedEvent implements DomainEvent {
  public readonly eventName = 'InvoiceIssued'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      invoiceNumber: string
      totalAmount: number
    }
  ) {}
}

export class InvoiceCancelledEvent implements DomainEvent {
  public readonly eventName = 'InvoiceCancelled'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      reason: string
    }
  ) {}
}

export class InvoicePaymentRegisteredEvent implements DomainEvent {
  public readonly eventName = 'InvoicePaymentRegistered'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      amount: number
      newStatus: InvoiceStatus
    }
  ) {}
}

export class InvoiceMarkedOverdueEvent implements DomainEvent {
  public readonly eventName = 'InvoiceMarkedOverdue'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, never>
  ) {}
}

export class InvoiceItemAddedEvent implements DomainEvent {
  public readonly eventName = 'InvoiceItemAdded'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      itemId: string
      description: string
      totalPrice: number
    }
  ) {}
}

export class InvoiceItemRemovedEvent implements DomainEvent {
  public readonly eventName = 'InvoiceItemRemoved'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      itemId: string
    }
  ) {}
}

export class InvoiceDiscountAppliedEvent implements DomainEvent {
  public readonly eventName = 'InvoiceDiscountApplied'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      type: string
      reason: string
    }
  ) {}
}

export class PaymentInitiatedEvent implements DomainEvent {
  public readonly eventName = 'PaymentInitiated'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      amount: number
      method: PaymentMethod
    }
  ) {}
}

export class PaymentConfirmedEvent implements DomainEvent {
  public readonly eventName = 'PaymentConfirmed'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      gatewayTransactionId: string
    }
  ) {}
}

export class PaymentFailedEvent implements DomainEvent {
  public readonly eventName = 'PaymentFailed'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      reason: string
    }
  ) {}
}

export class PaymentRefundedEvent implements DomainEvent {
  public readonly eventName = 'PaymentRefunded'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, never>
  ) {}
}

export class PaymentCancelledEvent implements DomainEvent {
  public readonly eventName = 'PaymentCancelled'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, never>
  ) {}
}

export class PixTransactionReceivedEvent implements DomainEvent {
  public readonly eventName = 'PixTransactionReceived'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      endToEndId: string
    }
  ) {}
}

export class PixTransactionConfirmedEvent implements DomainEvent {
  public readonly eventName = 'PixTransactionConfirmed'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, never>
  ) {}
}

export class PixTransactionExpiredEvent implements DomainEvent {
  public readonly eventName = 'PixTransactionExpired'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, never>
  ) {}
}

export class PixTransactionRefundedEvent implements DomainEvent {
  public readonly eventName = 'PixTransactionRefunded'
  public readonly occurredAt = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly payload: Record<string, never>
  ) {}
}
