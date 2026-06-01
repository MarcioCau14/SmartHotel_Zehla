import { Result } from '../../shared/Result'
import { Money } from '../value-objects/Money'
import { PaymentMethod } from '../PaymentMethod'
import { PaymentStatus } from '../PaymentStatus'
import { DomainEvent } from '../../shared/DomainEvent'

export interface PaymentProps {
  id: string
  reservationId: string
  propertyId: string
  amount: Money
  method: PaymentMethod
  status: PaymentStatus
  pixQrCode?: string
  pixCode?: string
  pixExpiration?: Date
  externalId?: string
  paidAt?: Date
  refundedAt?: Date
  createdAt: Date
}

export class Payment {
  private _events: DomainEvent[] = []

  private constructor(private props: PaymentProps) {}

  static create(props: {
    id: string
    reservationId: string
    propertyId: string
    amount: Money
    method: PaymentMethod
    externalId?: string
  }): Result<Payment, string> {
    if (props.amount.isZero()) {
      return Result.fail('Valor do pagamento deve ser maior que zero')
    }
    return Result.ok(
      new Payment({
        id: props.id,
        reservationId: props.reservationId,
        propertyId: props.propertyId,
        amount: props.amount,
        method: props.method,
        status: PaymentStatus.PENDING,
        externalId: props.externalId,
        createdAt: new Date(),
      })
    )
  }

  get id(): string { return this.props.id }
  get reservationId(): string { return this.props.reservationId }
  get propertyId(): string { return this.props.propertyId }
  get amount(): Money { return this.props.amount }
  get method(): PaymentMethod { return this.props.method }
  get status(): PaymentStatus { return this.props.status }
  get pixQrCode(): string | undefined { return this.props.pixQrCode }
  get pixCode(): string | undefined { return this.props.pixCode }
  get pixExpiration(): Date | undefined { return this.props.pixExpiration }
  get externalId(): string | undefined { return this.props.externalId }
  get paidAt(): Date | undefined { return this.props.paidAt }
  get refundedAt(): Date | undefined { return this.props.refundedAt }
  get createdAt(): Date { return this.props.createdAt }
  get events(): DomainEvent[] { return [...this._events] }

  confirm(paidAt: Date = new Date()): Result<void, string> {
    if (this.props.status !== PaymentStatus.PENDING) {
      return Result.fail('Apenas pagamentos pendentes podem ser confirmados')
    }
    this.props.status = PaymentStatus.PAID
    this.props.paidAt = paidAt
    this._events.push({
      aggregateId: this.props.reservationId,
      eventName: 'PaymentConfirmed',
      occurredAt: new Date(),
      payload: {
        paymentId: this.props.id,
        amount: this.props.amount.toJSON(),
        method: this.props.method,
      },
    })
    return Result.ok(undefined)
  }

  refund(): Result<void, string> {
    if (this.props.status !== PaymentStatus.PAID) {
      return Result.fail('Apenas pagamentos confirmados podem ser reembolsados')
    }
    this.props.status = PaymentStatus.REFUNDED
    this.props.refundedAt = new Date()
    return Result.ok(undefined)
  }

  fail(): Result<void, string> {
    if (this.props.status !== PaymentStatus.PENDING) {
      return Result.fail('Apenas pagamentos pendentes podem ser marcados como falha')
    }
    this.props.status = PaymentStatus.FAILED
    return Result.ok(undefined)
  }

  toJSON() {
    return {
      id: this.props.id,
      reservationId: this.props.reservationId,
      propertyId: this.props.propertyId,
      amount: this.props.amount.toJSON(),
      method: this.props.method,
      status: this.props.status,
      paidAt: this.props.paidAt?.toISOString(),
      refundedAt: this.props.refundedAt?.toISOString(),
      createdAt: this.props.createdAt.toISOString(),
    }
  }
}
