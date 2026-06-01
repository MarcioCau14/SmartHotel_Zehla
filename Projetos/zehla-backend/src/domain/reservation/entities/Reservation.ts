import { Result } from '../../shared/Result'
import { DomainEvent } from '../../shared/DomainEvent'
import { DateRange } from '../value-objects/DateRange'
import { Money } from '../value-objects/Money'
import { GuestCount } from '../value-objects/GuestCount'
import { GuestInfo } from '../value-objects/GuestInfo'
import { PricingBreakdown } from '../value-objects/PricingBreakdown'
import { ReservationStatus, canTransition, isActive, isFinal } from '../ReservationStatus'
import { CheckInStatus } from '../CheckInStatus'
import { Payment } from './Payment'
import { ReservationItem } from './ReservationItem'

export interface ReservationData {
  id: string
  code: string
  propertyId: string
  roomId: string
  guestInfo: GuestInfo
  guestCount: GuestCount
  period: DateRange
  pricing: PricingBreakdown
  paidAmount: Money
  status: ReservationStatus
  checkInStatus: CheckInStatus
  source: string
  notes?: string
  fnrhSubmittedAt?: Date
  payment?: Payment
  items: ReservationItem[]
  createdAt: Date
}

export class Reservation {
  private _events: DomainEvent[] = []

  private constructor(private data: ReservationData) {}

  static create(props: {
    id: string
    propertyId: string
    roomId: string
    guestInfo: GuestInfo
    guestCount: GuestCount
    period: DateRange
    pricing: PricingBreakdown
    source?: string
    notes?: string
  }): Result<Reservation, string> {
    const code = `ZEH-${Date.now()}`
    const reservation = new Reservation({
      id: props.id,
      code,
      propertyId: props.propertyId,
      roomId: props.roomId,
      guestInfo: props.guestInfo,
      guestCount: props.guestCount,
      period: props.period,
      pricing: props.pricing,
      paidAmount: Money.ZERO,
      status: ReservationStatus.CONFIRMED,
      checkInStatus: CheckInStatus.PENDING,
      source: props.source ?? 'DIRECT',
      notes: props.notes,
      items: [],
      createdAt: new Date(),
    })

    reservation._events.push({
      aggregateId: props.id,
      eventName: 'ReservationCreated',
      occurredAt: new Date(),
      payload: {
        propertyId: props.propertyId,
        roomId: props.roomId,
        guestPhone: props.guestInfo.phone,
        period: props.period.toJSON(),
        totalAmount: props.pricing.total.toJSON(),
        code,
      },
    })

    return Result.ok(reservation)
  }

  // --- Getters ---
  get id(): string { return this.data.id }
  get code(): string { return this.data.code }
  get propertyId(): string { return this.data.propertyId }
  get roomId(): string { return this.data.roomId }
  get guestInfo(): GuestInfo { return this.data.guestInfo }
  get guestCount(): GuestCount { return this.data.guestCount }
  get period(): DateRange { return this.data.period }
  get pricing(): PricingBreakdown { return this.data.pricing }
  get paidAmount(): Money { return this.data.paidAmount }
  get status(): ReservationStatus { return this.data.status }
  get checkInStatus(): CheckInStatus { return this.data.checkInStatus }
  get source(): string { return this.data.source }
  get notes(): string | undefined { return this.data.notes }
  get fnrhSubmittedAt(): Date | undefined { return this.data.fnrhSubmittedAt }
  get payment(): Payment | undefined { return this.data.payment }
  get items(): ReservationItem[] { return [...this.data.items] }
  get createdAt(): Date { return this.data.createdAt }
  get events(): DomainEvent[] { return [...this._events] }

  get balance(): Money {
    return this.data.pricing.total.subtract(this.data.paidAmount).getOrElse(this.data.pricing.total)
  }

  get isPaid(): boolean {
    return !this.balance.isGreaterThan(Money.ZERO)
  }

  // --- Comandos ---

  confirm(): Result<void, string> {
    const allowed = canTransition(this.data.status, ReservationStatus.CONFIRMED)
    if (!allowed) {
      return Result.fail(`Não é possível confirmar reserva com status ${this.data.status}`)
    }
    this.data.status = ReservationStatus.CONFIRMED
    return Result.ok(undefined)
  }

  awaitPayment(): Result<void, string> {
    const allowed = canTransition(this.data.status, ReservationStatus.AWAITING_PAYMENT)
    if (!allowed) {
      return Result.fail(`Não é possível colocar reserva em aguardo de pagamento com status ${this.data.status}`)
    }
    this.data.status = ReservationStatus.AWAITING_PAYMENT
    return Result.ok(undefined)
  }

  cancel(): Result<void, string> {
    if (isFinal(this.data.status)) {
      return Result.fail(`Reserva já está finalizada (${this.data.status})`)
    }
    this.data.status = ReservationStatus.CANCELLED
    this._events.push({
      aggregateId: this.data.id,
      eventName: 'ReservationCancelled',
      occurredAt: new Date(),
      payload: {
        propertyId: this.data.propertyId,
        roomId: this.data.roomId,
        code: this.data.code,
      },
    })
    return Result.ok(undefined)
  }

  checkIn(): Result<void, string> {
    const allowed = canTransition(this.data.status, ReservationStatus.CHECKED_IN)
    if (!allowed) {
      return Result.fail(
        `Não é possível fazer check-in de reserva com status ${this.data.status}`
      )
    }
    if (!this.isPaid) {
      return Result.fail('Check-in bloqueado: pagamento pendente')
    }
    this.data.status = ReservationStatus.CHECKED_IN
    this.data.checkInStatus = CheckInStatus.DONE
    this._events.push({
      aggregateId: this.data.id,
      eventName: 'CheckInDone',
      occurredAt: new Date(),
      payload: {
        propertyId: this.data.propertyId,
        roomId: this.data.roomId,
        guestName: this.data.guestInfo.name,
        code: this.data.code,
      },
    })
    return Result.ok(undefined)
  }

  checkOut(): Result<void, string> {
    const allowed = canTransition(this.data.status, ReservationStatus.CHECKED_OUT)
    if (!allowed) {
      return Result.fail(
        `Não é possível fazer check-out de reserva com status ${this.data.status}`
      )
    }
    this.data.status = ReservationStatus.CHECKED_OUT
    this._events.push({
      aggregateId: this.data.id,
      eventName: 'CheckOutDone',
      occurredAt: new Date(),
      payload: {
        propertyId: this.data.propertyId,
        roomId: this.data.roomId,
        totalAmount: this.data.pricing.total.toJSON(),
        code: this.data.code,
      },
    })
    return Result.ok(undefined)
  }

  markNoShow(): Result<void, string> {
    if (this.data.status !== ReservationStatus.CONFIRMED) {
      return Result.fail('Apenas reservas confirmadas podem ser marcadas como no-show')
    }
    this.data.status = ReservationStatus.NO_SHOW
    this.data.checkInStatus = CheckInStatus.DELAYED
    return Result.ok(undefined)
  }

  addPayment(payment: Payment): Result<void, string> {
    if (this.data.payment) {
      return Result.fail('Reserva já possui um pagamento vinculado')
    }
    this.data.payment = payment
    this._events.push({
      aggregateId: this.data.id,
      eventName: 'PaymentLinked',
      occurredAt: new Date(),
      payload: {
        paymentId: payment.id,
        amount: payment.amount.toJSON(),
        method: payment.method,
      },
    })
    return Result.ok(undefined)
  }

  applyPayment(amount: Money): Result<void, string> {
    const newPaid = this.data.paidAmount.add(amount)
    if (newPaid.amount > this.data.pricing.total.amount) {
      return Result.fail('Valor pago excede o total da reserva')
    }
    this.data.paidAmount = newPaid
    return Result.ok(undefined)
  }

  addItem(item: ReservationItem): void {
    this.data.items.push(item)
  }

  updateGuestInfo(info: GuestInfo): void {
    this.data.guestInfo = info
  }

  updatePeriod(period: DateRange): void {
    this.data.period = period
  }

  updateNotes(notes: string): void {
    this.data.notes = notes
  }

  submitFnrh(): void {
    this.data.fnrhSubmittedAt = new Date()
  }

  clearEvents(): void {
    this._events = []
  }

  toJSON() {
    return {
      id: this.data.id,
      code: this.data.code,
      propertyId: this.data.propertyId,
      roomId: this.data.roomId,
      guestInfo: this.data.guestInfo.toJSON(),
      guestCount: this.data.guestCount.toJSON(),
      period: this.data.period.toJSON(),
      pricing: this.data.pricing.toJSON(),
      paidAmount: this.data.paidAmount.toJSON(),
      status: this.data.status,
      checkInStatus: this.data.checkInStatus,
      source: this.data.source,
      notes: this.data.notes,
      fnrhSubmittedAt: this.data.fnrhSubmittedAt?.toISOString(),
      payment: this.data.payment?.toJSON(),
      items: this.data.items.map((i) => i.toJSON()),
      createdAt: this.data.createdAt.toISOString(),
    }
  }
}
