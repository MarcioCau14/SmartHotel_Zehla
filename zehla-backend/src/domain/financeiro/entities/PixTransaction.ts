import { Result } from '../../shared/Result'
import { DomainEvent } from '../../shared/DomainEvent'
import { PixStatus, canTransitionPixStatus } from '../enums'
import { PixKey } from '../value-objects/PixKey'
import { Money } from '../value-objects/Money'
import {
  PixTransactionReceivedEvent,
  PixTransactionConfirmedEvent,
  PixTransactionExpiredEvent,
  PixTransactionRefundedEvent,
} from '../events'

export interface PixTransactionData {
  id: string
  status: PixStatus
  pixKey: PixKey
  amount: Money
  description: string
  endToEndId: string | null
  qrCode: string
  expiresAt: Date
  confirmedAt: Date | null
  createdAt: Date
}

export class PixTransaction {
  private _events: DomainEvent[] = []

  private constructor(private data: PixTransactionData) {}

  static restore(data: PixTransactionData): PixTransaction {
    return new PixTransaction({ ...data })
  }

  static create(props: {
    id: string
    pixKey: PixKey
    amount: Money
    description: string
    qrCode: string
    expiresAt: Date
  }): Result<PixTransaction, string> {
    if (!props.id) return Result.fail('PixTransaction ID is required')
    if (!props.description || props.description.trim().length === 0) {
      return Result.fail('Description is required')
    }
    if (props.amount.isZero()) return Result.fail('Amount must be greater than zero')
    if (isNaN(props.expiresAt.getTime())) return Result.fail('Invalid expiresAt date')

    return Result.ok(new PixTransaction({
      id: props.id,
      status: PixStatus.AWAITING_PAYMENT,
      pixKey: props.pixKey,
      amount: props.amount,
      description: props.description.trim(),
      endToEndId: null,
      qrCode: props.qrCode,
      expiresAt: props.expiresAt,
      confirmedAt: null,
      createdAt: new Date(),
    }))
  }

  get id(): string { return this.data.id }
  get status(): PixStatus { return this.data.status }
  get pixKey(): PixKey { return this.data.pixKey }
  get amount(): Money { return this.data.amount }
  get description(): string { return this.data.description }
  get endToEndId(): string | null { return this.data.endToEndId }
  get qrCode(): string { return this.data.qrCode }
  get expiresAt(): Date { return this.data.expiresAt }
  get confirmedAt(): Date | null { return this.data.confirmedAt }
  get createdAt(): Date { return this.data.createdAt }
  get events(): DomainEvent[] { return [...this._events] }

  isExpired(): boolean {
    return this.data.status === PixStatus.EXPIRED || new Date() > this.data.expiresAt
  }

  markReceived(endToEndId: string): Result<void, string> {
    if (!canTransitionPixStatus(this.data.status, PixStatus.RECEIVED)) {
      return Result.fail(`Cannot mark as received from status ${this.data.status}`)
    }
    if (!endToEndId || endToEndId.trim().length === 0) {
      return Result.fail('endToEndId is required')
    }

    this.data.status = PixStatus.RECEIVED
    this.data.endToEndId = endToEndId.trim()

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PixTransactionReceived',
      occurredAt: new Date(),
      payload: { endToEndId: endToEndId.trim() },
    } as PixTransactionReceivedEvent)

    return Result.ok(undefined)
  }

  confirm(): Result<void, string> {
    if (!canTransitionPixStatus(this.data.status, PixStatus.CONFIRMED)) {
      return Result.fail(`Cannot confirm Pix from status ${this.data.status}`)
    }

    this.data.status = PixStatus.CONFIRMED
    this.data.confirmedAt = new Date()

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PixTransactionConfirmed',
      occurredAt: new Date(),
      payload: {},
    } as PixTransactionConfirmedEvent)

    return Result.ok(undefined)
  }

  expire(): Result<void, string> {
    if (!canTransitionPixStatus(this.data.status, PixStatus.EXPIRED)) {
      return Result.fail(`Cannot expire Pix from status ${this.data.status}`)
    }

    this.data.status = PixStatus.EXPIRED

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PixTransactionExpired',
      occurredAt: new Date(),
      payload: {},
    } as PixTransactionExpiredEvent)

    return Result.ok(undefined)
  }

  refund(): Result<void, string> {
    if (!canTransitionPixStatus(this.data.status, PixStatus.REFUNDED)) {
      return Result.fail(`Cannot refund Pix from status ${this.data.status}`)
    }

    this.data.status = PixStatus.REFUNDED

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PixTransactionRefunded',
      occurredAt: new Date(),
      payload: {},
    } as PixTransactionRefundedEvent)

    return Result.ok(undefined)
  }

  clearEvents(): void {
    this._events = []
  }
}
