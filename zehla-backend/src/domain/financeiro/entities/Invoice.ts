import { Result } from '../../shared/Result'
import { DomainEvent } from '../../shared/DomainEvent'
import { InvoiceStatus, canTransitionInvoiceStatus } from '../enums'
import { Money } from '../value-objects/Money'
import { InvoiceNumber } from '../value-objects/InvoiceNumber'
import { BillingPeriod } from '../value-objects/BillingPeriod'
import { Discount } from '../value-objects/Discount'
import { InvoiceItem } from './InvoiceItem'
import {
  InvoiceIssuedEvent,
  InvoiceCancelledEvent,
  InvoicePaymentRegisteredEvent,
  InvoiceMarkedOverdueEvent,
  InvoiceItemAddedEvent,
  InvoiceItemRemovedEvent,
  InvoiceDiscountAppliedEvent,
} from '../events'

export interface InvoiceData {
  id: string
  number: InvoiceNumber
  guestId: string
  reservationId: string
  status: InvoiceStatus
  billingPeriod: BillingPeriod
  items: InvoiceItem[]
  discounts: Discount[]
  paidAmount: Money
  issuedAt: Date | null
  cancelledAt: Date | null
  cancelReason: string | null
  overdueAt: Date | null
  createdAt: Date
}

export class Invoice {
  private _events: DomainEvent[] = []

  private constructor(private data: InvoiceData) {}

  static restore(data: InvoiceData): Invoice {
    return new Invoice({ ...data })
  }

  static create(props: {
    id: string
    number: InvoiceNumber
    guestId: string
    reservationId: string
    billingPeriod: BillingPeriod
  }): Result<Invoice, string> {
    if (!props.id) return Result.fail('Invoice ID is required')
    if (!props.guestId) return Result.fail('Guest ID is required')
    if (!props.reservationId) return Result.fail('Reservation ID is required')

    const invoice = new Invoice({
      id: props.id,
      number: props.number,
      guestId: props.guestId,
      reservationId: props.reservationId,
      status: InvoiceStatus.DRAFT,
      billingPeriod: props.billingPeriod,
      items: [],
      discounts: [],
      paidAmount: Money.zero(),
      issuedAt: null,
      cancelledAt: null,
      cancelReason: null,
      overdueAt: null,
      createdAt: new Date(),
    })

    return Result.ok(invoice)
  }

  get id(): string { return this.data.id }
  get number(): InvoiceNumber { return this.data.number }
  get guestId(): string { return this.data.guestId }
  get reservationId(): string { return this.data.reservationId }
  get status(): InvoiceStatus { return this.data.status }
  get billingPeriod(): BillingPeriod { return this.data.billingPeriod }
  get items(): InvoiceItem[] { return [...this.data.items] }
  get discounts(): Discount[] { return [...this.data.discounts] }
  get paidAmount(): Money { return this.data.paidAmount }
  get issuedAt(): Date | null { return this.data.issuedAt }
  get cancelledAt(): Date | null { return this.data.cancelledAt }
  get cancelReason(): string | null { return this.data.cancelReason }
  get overdueAt(): Date | null { return this.data.overdueAt }
  get createdAt(): Date { return this.data.createdAt }
  get events(): DomainEvent[] { return [...this._events] }

  get totalAmount(): Money {
    const itemsTotal = this.data.items.reduce((acc, item) => {
      const sum = acc.add(item.totalPrice)
      return sum.isOk ? sum.value : acc
    }, Money.zero())

    const discountsTotal = this.data.discounts.reduce((acc, d) => {
      if (d.type === 'FIXED') {
        const sum = acc.add(d.value)
        return sum.isOk ? sum.value : acc
      }
      const pctAmt = itemsTotal.percentage(d.percentage ?? 0)
      const sum = acc.add(pctAmt)
      return sum.isOk ? sum.value : acc
    }, Money.zero())

    const result = itemsTotal.subtract(discountsTotal)
    return result.isOk ? result.value : itemsTotal
  }

  remainingBalance(): Money {
    const result = this.totalAmount.subtract(this.data.paidAmount)
    return result.isOk ? result.value : Money.zero()
  }

  isFullyPaid(): boolean {
    return this.status === InvoiceStatus.PAID
  }

  addItem(item: InvoiceItem): Result<void, string> {
    if (this.data.status !== InvoiceStatus.DRAFT && this.data.status !== InvoiceStatus.ISSUED) {
      return Result.fail('Cannot add items to invoice in current status')
    }

    this.data.items.push(item)
    this._events.push({
      aggregateId: this.data.id,
      eventName: 'InvoiceItemAdded',
      occurredAt: new Date(),
      payload: { itemId: item.id, description: item.description, totalPrice: item.totalPrice.toNumber() },
    } as InvoiceItemAddedEvent)

    return Result.ok(undefined)
  }

  removeItem(itemId: string): Result<void, string> {
    if (this.data.status !== InvoiceStatus.DRAFT && this.data.status !== InvoiceStatus.ISSUED) {
      return Result.fail('Cannot remove items from invoice in current status')
    }

    const index = this.data.items.findIndex(i => i.id === itemId)
    if (index === -1) return Result.fail('Item not found')

    this.data.items.splice(index, 1)
    this._events.push({
      aggregateId: this.data.id,
      eventName: 'InvoiceItemRemoved',
      occurredAt: new Date(),
      payload: { itemId },
    } as InvoiceItemRemovedEvent)

    return Result.ok(undefined)
  }

  applyDiscount(discount: Discount): Result<void, string> {
    if (this.data.status !== InvoiceStatus.DRAFT && this.data.status !== InvoiceStatus.ISSUED) {
      return Result.fail('Cannot apply discount to invoice in current status')
    }

    this.data.discounts.push(discount)
    this._events.push({
      aggregateId: this.data.id,
      eventName: 'InvoiceDiscountApplied',
      occurredAt: new Date(),
      payload: { type: discount.type, reason: discount.reason },
    } as InvoiceDiscountAppliedEvent)

    return Result.ok(undefined)
  }

  issue(): Result<void, string> {
    if (!canTransitionInvoiceStatus(this.data.status, InvoiceStatus.ISSUED)) {
      return Result.fail(`Cannot issue invoice from status ${this.data.status}`)
    }
    if (this.data.items.length === 0) {
      return Result.fail('Cannot issue invoice without items')
    }

    this.data.status = InvoiceStatus.ISSUED
    this.data.issuedAt = new Date()

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'InvoiceIssued',
      occurredAt: new Date(),
      payload: { invoiceNumber: this.data.number.value, totalAmount: this.totalAmount.toNumber() },
    } as InvoiceIssuedEvent)

    return Result.ok(undefined)
  }

  registerPayment(amount: Money): Result<void, string> {
    if (this.data.status !== InvoiceStatus.ISSUED && this.data.status !== InvoiceStatus.PARTIALLY_PAID) {
      return Result.fail(`Cannot register payment in status ${this.data.status}`)
    }

    if (amount.isZero()) return Result.fail('Payment amount must be greater than zero')

    const remaining = this.remainingBalance()
    if (amount.isGreaterThan(remaining)) {
      return Result.fail('Payment amount exceeds remaining balance')
    }

    const newPaid = this.data.paidAmount.add(amount)
    if (newPaid.isFail) return Result.fail('Error adding payment')

    this.data.paidAmount = newPaid.value

    if (this.data.paidAmount.amount >= this.totalAmount.amount) {
      this.data.status = InvoiceStatus.PAID
    } else {
      this.data.status = InvoiceStatus.PARTIALLY_PAID
    }

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'InvoicePaymentRegistered',
      occurredAt: new Date(),
      payload: { amount: amount.toNumber(), newStatus: this.data.status },
    } as InvoicePaymentRegisteredEvent)

    return Result.ok(undefined)
  }

  cancel(reason: string): Result<void, string> {
    if (!canTransitionInvoiceStatus(this.data.status, InvoiceStatus.CANCELLED)) {
      return Result.fail(`Cannot cancel invoice from status ${this.data.status}. Refund first if paid.`)
    }
    if (!reason || reason.trim().length < 3) {
      return Result.fail('Cancel reason must be at least 3 characters')
    }

    this.data.status = InvoiceStatus.CANCELLED
    this.data.cancelledAt = new Date()
    this.data.cancelReason = reason.trim()

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'InvoiceCancelled',
      occurredAt: new Date(),
      payload: { reason: reason.trim() },
    } as InvoiceCancelledEvent)

    return Result.ok(undefined)
  }

  markOverdue(): Result<void, string> {
    if (!canTransitionInvoiceStatus(this.data.status, InvoiceStatus.OVERDUE)) {
      return Result.fail(`Cannot mark overdue from status ${this.data.status}`)
    }

    this.data.status = InvoiceStatus.OVERDUE
    this.data.overdueAt = new Date()

    this._events.push({
      aggregateId: this.data.id,
      eventName: 'InvoiceMarkedOverdue',
      occurredAt: new Date(),
      payload: {},
    } as InvoiceMarkedOverdueEvent)

    return Result.ok(undefined)
  }

  clearEvents(): void {
    this._events = []
  }
}
