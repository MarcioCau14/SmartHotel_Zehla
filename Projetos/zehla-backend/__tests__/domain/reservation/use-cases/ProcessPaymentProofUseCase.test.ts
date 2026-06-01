import { describe, it, expect, beforeEach } from 'vitest'
import { ProcessPaymentProofUseCase } from '../../../../src/application/reservation/use-cases/ProcessPaymentProofUseCase'
import { InMemoryReservationRepository } from '../../../../src/infrastructure/persistence/reservation/InMemoryReservationRepository'
import { IReservationRepository } from '../../../../src/application/reservation/ports/IReservationRepository'
import { IPaymentRepository } from '../../../../src/application/reservation/ports/IPaymentRepository'
import { IEventBus } from '../../../../src/application/reservation/ports/IEventBus'
import { Payment } from '../../../../src/domain/reservation/entities/Payment'
import { Reservation } from '../../../../src/domain/reservation/entities/Reservation'
import { ReservationStatus } from '../../../../src/domain/reservation/ReservationStatus'
import { DomainEvent } from '../../../../src/domain/shared/DomainEvent'
import { DateRange } from '../../../../src/domain/reservation/value-objects/DateRange'
import { Money } from '../../../../src/domain/reservation/value-objects/Money'
import { GuestCount } from '../../../../src/domain/reservation/value-objects/GuestCount'
import { GuestInfo } from '../../../../src/domain/reservation/value-objects/GuestInfo'
import { PricingBreakdown } from '../../../../src/domain/reservation/value-objects/PricingBreakdown'

class FakePaymentRepository implements IPaymentRepository {
  private payments = new Map<string, Payment>()

  async save(payment: Payment): Promise<Payment> {
    this.payments.set(payment.id, payment)
    return payment
  }

  async update(payment: Payment): Promise<Payment> {
    this.payments.set(payment.id, payment)
    return payment
  }

  async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) ?? null
  }

  async findByReservationId(reservationId: string): Promise<Payment | null> {
    for (const p of this.payments.values()) {
      if (p.reservationId === reservationId) return p
    }
    return null
  }

  async findByExternalId(externalId: string): Promise<Payment | null> {
    for (const p of this.payments.values()) {
      if (p.externalId === externalId) return p
    }
    return null
  }

  async findByProperty(_propertyId: string): Promise<Payment[]> {
    return Array.from(this.payments.values())
  }
}

class FakeEventBus implements IEventBus {
  events: DomainEvent[] = []
  async publish(event: DomainEvent) { this.events.push(event) }
  async publishMany(events: DomainEvent[]) { this.events.push(...events) }
}

function createReservationInStatus(status: ReservationStatus, overrides: Partial<any> = {}) {
  const guestInfo = GuestInfo.create({
    name: 'João Silva',
    phone: '5511999999999',
    email: 'joao@test.com',
  }).value
  const guestCount = GuestCount.create(2).value
  const period = DateRange.createFromStrings('2026-07-01', '2026-07-05').value
  const pricing = PricingBreakdown.create({
    roomPrice: Money.create(200).value,
    nights: period.nights,
    discount: Money.ZERO,
  }).value

  const result = Reservation.create({
    id: overrides.id ?? 'res-1',
    propertyId: overrides.propertyId ?? 'prop-1',
    roomId: 'room-1',
    guestInfo,
    guestCount,
    period,
    pricing,
    source: 'WHATSAPP',
  })
  const r = result.value
  r.clearEvents()
  if (status === ReservationStatus.AWAITING_PAYMENT) {
    r.awaitPayment()
    r.clearEvents()
  }
  return r
}

describe('ProcessPaymentProofUseCase', () => {
  let reservationRepo: InMemoryReservationRepository
  let paymentRepo: FakePaymentRepository
  let eventBus: FakeEventBus
  let useCase: ProcessPaymentProofUseCase

  beforeEach(() => {
    reservationRepo = new InMemoryReservationRepository()
    paymentRepo = new FakePaymentRepository()
    eventBus = new FakeEventBus()
    useCase = new ProcessPaymentProofUseCase(reservationRepo, paymentRepo, eventBus)
  })

  it('should process payment with contextReservationId', async () => {
    const reservation = createReservationInStatus(ReservationStatus.AWAITING_PAYMENT)
    await reservationRepo.save(reservation)

    const result = await useCase.execute({
      phone: '5511999999999',
      propertyId: 'prop-1',
      amount: 800,
      transactionId: 'tx-123',
      contextReservationId: 'res-1',
    })

    expect(result.isOk).toBe(true)
    expect(result.value.reservationId).toBe('res-1')
    expect(result.value.amount).toBe(800)
  })

  it('should find reservation by phone when contextReservationId is UNKNOWN', async () => {
    const reservation = createReservationInStatus(ReservationStatus.AWAITING_PAYMENT, { id: 'res-2' })
    await reservationRepo.save(reservation)

    const result = await useCase.execute({
      phone: '5511999999999',
      propertyId: 'prop-1',
      amount: 800,
      transactionId: 'tx-456',
      contextReservationId: 'UNKNOWN',
    })

    expect(result.isOk).toBe(true)
    expect(result.value.reservationId).toBe('res-2')
  })

  it('should fail when reservation is not found', async () => {
    const result = await useCase.execute({
      phone: '5511999999999',
      propertyId: 'prop-1',
      amount: 800,
      transactionId: 'tx-789',
      contextReservationId: 'nonexistent',
    })

    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrada')
  })

  it('should fail when phone has no awaiting payment reservation', async () => {
    const result = await useCase.execute({
      phone: '5511988888888',
      propertyId: 'prop-1',
      amount: 800,
      transactionId: 'tx-999',
    })

    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrada')
  })

  it('should publish events on successful payment', async () => {
    const reservation = createReservationInStatus(ReservationStatus.AWAITING_PAYMENT, { id: 'res-3' })
    await reservationRepo.save(reservation)

    await useCase.execute({
      phone: '5511999999999',
      propertyId: 'prop-1',
      amount: 800,
      transactionId: 'tx-events',
      contextReservationId: 'res-3',
    })

    expect(eventBus.events.length).toBeGreaterThanOrEqual(1)
    const eventNames = eventBus.events.map((e) => e.eventName)
    expect(eventNames).toContain('PaymentLinked')
  })

  it('should transition reservation to CONFIRMED when fully paid', async () => {
    const reservation = createReservationInStatus(ReservationStatus.AWAITING_PAYMENT, { id: 'res-4' })
    await reservationRepo.save(reservation)

    await useCase.execute({
      phone: '5511999999999',
      propertyId: 'prop-1',
      amount: 800,
      transactionId: 'tx-confirm',
      contextReservationId: 'res-4',
    })

    const updated = await reservationRepo.findById('res-4')
    expect(updated).not.toBeNull()
    expect(updated!.status).toBe(ReservationStatus.CONFIRMED)
    expect(updated!.isPaid).toBe(true)
  })
})
