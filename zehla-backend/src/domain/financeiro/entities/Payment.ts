import { Result } from '../../shared/Result'
import { DomainEvent } from '../../shared/DomainEvent'
import { PaymentStatus, PaymentMethod, canTransitionPaymentStatus } from '../enums'
import { Money } from '../value-objects/Money'
import { PixTransaction } from './PixTransaction'
import {
  PaymentInitiatedEvent,
  PaymentConfirmedEvent,
  PaymentFailedEvent,
  PaymentRefundedEvent,
  PaymentCancelledEvent,
} from '../events'

export interface PaymentData {
  id: string
  invoiceId: string
  status: PaymentStatus
  method: PaymentMethod
  amount: Money
  gatewayTransactionId: string | null
  failureReason: string | null
  pixTransaction: PixTransaction | null
  processedAt: Date | null
  createdAt: Date
}

export class Payment {
  private _events: DomainEvent[] = []

  private constructor(private data: PaymentData) {}

  static restore(data: PaymentData): Payment {
    return new Payment({ ...data })
  }

  static create(props: {
    id: string
    invoiceId: string
    method: PaymentMethod
    amount: Money
    pixTransaction?: PixTransaction
  }): Result<Payment, string> {
    if (!props.id) return Result.fail('Payment ID is required')
    if (!props.invoiceId) return Result.fail('Invoice ID is required')
    if (props.amount.isZero()) return Result.fail('Amount must be greater than zero')

    if (props.method === PaymentMethod.PIX && !props.pixTransaction) {
      return Result.fail('Pix transaction is required for PIX payments')
    }

    return Result.ok(new Payment({
      id: props.id,
      invoiceId: props.invoiceId,
      status: PaymentStatus.PENDING,
      method: props.method,
      amount: props.amount,
      gatewayTransactionId: null,
      failureReason: null,
      pixTransaction: props.pixTransaction ?? null,
      processedAt: null,
      createdAt: new Date(),
    }))
  }

  get id(): string { return this.data.id }
  get invoiceId(): string { return this.data.invoiceId }
  get status(): PaymentStatus { return this.data.status }
  get method(): PaymentMethod { return this.data.method }
  get amount(): Money { return this.data.amount }
  get gatewayTransactionId(): string | null { return this.data.gatewayTransactionId }
  get failureReason(): string | null { return this.data.failureReason }
  get pixTransaction(): PixTransaction | null { return this.data.pixTransaction }
  get processedAt(): Date | null { return this.data.processedAt }
  get createdAt(): Date { return this.data.createdAt }
  get events(): DomainEvent[] { return [...this._events] }

  initiate(): Result<void, string> {
    if (!canTransitionPaymentStatus(this.data.status, PaymentStatus.PROCESSING)) {
      return Result.fail(`Cannot initiate payment from status ${this.data.status}`)
    }

    this.data.status = PaymentStatus.PROCESSING

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PaymentInitiated',
      occurredAt: new Date(),
      payload: { amount: this.data.amount.toNumber(), method: this.data.method },
    } as PaymentInitiatedEvent)

    return Result.ok(undefined)
  }

  confirm(gatewayTransactionId: string): Result<void, string> {
    if (!canTransitionPaymentStatus(this.data.status, PaymentStatus.CONFIRMED)) {
      return Result.fail(`Cannot confirm payment from status ${this.data.status}`)
    }
    if (!gatewayTransactionId || gatewayTransactionId.trim().length === 0) {
      return Result.fail('Gateway transaction ID is required')
    }

    this.data.status = PaymentStatus.CONFIRMED
    this.data.gatewayTransactionId = gatewayTransactionId.trim()
    this.data.processedAt = new Date()

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PaymentConfirmed',
      occurredAt: new Date(),
      payload: { gatewayTransactionId: gatewayTransactionId.trim() },
    } as PaymentConfirmedEvent)

    return Result.ok(undefined)
  }

  fail(reason: string): Result<void, string> {
    if (!canTransitionPaymentStatus(this.data.status, PaymentStatus.FAILED)) {
      return Result.fail(`Cannot fail payment from status ${this.data.status}`)
    }
    if (!reason || reason.trim().length === 0) {
      return Result.fail('Failure reason is required')
    }

    this.data.status = PaymentStatus.FAILED
    this.data.failureReason = reason.trim()

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PaymentFailed',
      occurredAt: new Date(),
      payload: { reason: reason.trim() },
    } as PaymentFailedEvent)

    return Result.ok(undefined)
  }

  refund(): Result<void, string> {
    if (!canTransitionPaymentStatus(this.data.status, PaymentStatus.REFUNDED)) {
      return Result.fail(`Cannot refund payment from status ${this.data.status}`)
    }

    this.data.status = PaymentStatus.REFUNDED

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PaymentRefunded',
      occurredAt: new Date(),
      payload: {},
    } as PaymentRefundedEvent)

    return Result.ok(undefined)
  }

  cancel(): Result<void, string> {
    if (!canTransitionPaymentStatus(this.data.status, PaymentStatus.CANCELLED)) {
      return Result.fail(`Cannot cancel payment from status ${this.data.status}`)
    }

    this.data.status = PaymentStatus.CANCELLED

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PaymentCancelled',
      occurredAt: new Date(),
      payload: {},
    } as PaymentCancelledEvent)

    return Result.ok(undefined)
  }

  clearEvents(): void {
    this._events = []
  }
}
