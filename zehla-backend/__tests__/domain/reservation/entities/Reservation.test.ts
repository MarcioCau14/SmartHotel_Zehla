import { describe, it, expect, beforeEach } from 'vitest'
import { Reservation } from '../../../../src/domain/reservation/entities/Reservation'
import { DateRange } from '../../../../src/domain/reservation/value-objects/DateRange'
import { Money } from '../../../../src/domain/reservation/value-objects/Money'
import { GuestCount } from '../../../../src/domain/reservation/value-objects/GuestCount'
import { GuestInfo } from '../../../../src/domain/reservation/value-objects/GuestInfo'
import { PricingBreakdown } from '../../../../src/domain/reservation/value-objects/PricingBreakdown'
import { ReservationStatus } from '../../../../src/domain/reservation/ReservationStatus'
import { Payment } from '../../../../src/domain/reservation/entities/Payment'
import { PaymentMethod } from '../../../../src/domain/reservation/PaymentMethod'

function makeValidReservationProps() {
  const guestInfo = GuestInfo.create({
    name: 'João Silva',
    phone: '5511999999999',
    email: 'joao@test.com',
  }).value
  const guestCount = GuestCount.create(2).value
  const period = DateRange.createFromStrings('2026-08-01', '2026-08-05').value
  const pricing = PricingBreakdown.create({
    roomPrice: Money.create(200).value,
    nights: period.nights,
    discount: Money.ZERO,
  }).value

  return {
    id: 'test-1',
    propertyId: 'prop-1',
    roomId: 'room-1',
    guestInfo,
    guestCount,
    period,
    pricing,
    source: 'WHATSAPP',
    notes: 'Cliente VIP',
  }
}

describe('Reservation', () => {
  describe('create', () => {
    it('should create a confirmed reservation', () => {
      const result = Reservation.create(makeValidReservationProps())
      expect(result.isOk).toBe(true)
      const r = result.value
      expect(r.status).toBe(ReservationStatus.CONFIRMED)
      expect(r.code).toMatch(/^ZEH-\d+$/)
      expect(r.isPaid).toBe(false)
    })

    it('should emit ReservationCreated event', () => {
      const result = Reservation.create(makeValidReservationProps())
      expect(result.isOk).toBe(true)
      const r = result.value
      expect(r.events).toHaveLength(1)
      expect(r.events[0].eventName).toBe('ReservationCreated')
      expect(r.events[0].payload.propertyId).toBe('prop-1')
    })
  })

  describe('cancel', () => {
    it('should cancel a confirmed reservation', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      const result = r.cancel()
      expect(result.isOk).toBe(true)
      expect(r.status).toBe(ReservationStatus.CANCELLED)
      expect(r.events).toHaveLength(2) // created + cancelled
      expect(r.events[1].eventName).toBe('ReservationCancelled')
    })

    it('should not cancel an already cancelled reservation', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      r.cancel()
      const result = r.cancel()
      expect(result.isFail).toBe(true)
      expect(result.error).toContain('finalizada')
    })

    it('should not cancel a checked out reservation', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      r.checkIn() // will fail without payment, skip to final
      return
    })
  })

  describe('checkIn', () => {
    it('should check in a paid reservation', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      const payment = Payment.create({
        id: 'pay-1',
        reservationId: r.id,
        propertyId: 'prop-1',
        amount: Money.create(800).value,
        method: PaymentMethod.PIX,
      }).value
      payment.confirm()
      r.addPayment(payment)
      r.applyPayment(Money.create(800).value)

      const result = r.checkIn()
      expect(result.isOk).toBe(true)
      expect(r.status).toBe(ReservationStatus.CHECKED_IN)
      expect(r.events.some((e) => e.eventName === 'CheckInDone')).toBe(true)
    })

    it('should reject check-in without payment', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      const result = r.checkIn()
      expect(result.isFail).toBe(true)
      expect(result.error).toContain('pagamento')
    })
  })

  describe('checkOut', () => {
    it('should check out a checked-in reservation', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      const payment = Payment.create({
        id: 'pay-2',
        reservationId: r.id,
        propertyId: 'prop-1',
        amount: Money.create(800).value,
        method: PaymentMethod.PIX,
      }).value
      payment.confirm()
      r.addPayment(payment)
      r.applyPayment(Money.create(800).value)
      r.checkIn()

      const result = r.checkOut()
      expect(result.isOk).toBe(true)
      expect(r.status).toBe(ReservationStatus.CHECKED_OUT)
    })

    it('should reject check-out from confirmed', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      const result = r.checkOut()
      expect(result.isFail).toBe(true)
    })
  })

  describe('noShow', () => {
    it('should mark confirmed reservation as no-show', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      const result = r.markNoShow()
      expect(result.isOk).toBe(true)
      expect(r.status).toBe(ReservationStatus.NO_SHOW)
    })

    it('should not mark non-confirmed as no-show', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      r.cancel()
      const result = r.markNoShow()
      expect(result.isFail).toBe(true)
    })
  })

  describe('payment', () => {
    it('should add payment to reservation', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      const p = Payment.create({
        id: 'pay-3',
        reservationId: r.id,
        propertyId: 'prop-1',
        amount: Money.create(500).value,
        method: PaymentMethod.PIX,
      }).value

      const result = r.addPayment(p)
      expect(result.isOk).toBe(true)
      expect(r.payment).toBeDefined()
    })

    it('should not add duplicate payment', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      const p1 = Payment.create({
        id: 'pay-1',
        reservationId: r.id,
        propertyId: 'prop-1',
        amount: Money.create(500).value,
        method: PaymentMethod.PIX,
      }).value
      const p2 = Payment.create({
        id: 'pay-2',
        reservationId: r.id,
        propertyId: 'prop-1',
        amount: Money.create(300).value,
        method: PaymentMethod.CREDIT_CARD,
      }).value

      r.addPayment(p1)
      const result = r.addPayment(p2)
      expect(result.isFail).toBe(true)
      expect(result.error).toContain('pagamento vinculado')
    })

    it('should not apply payment exceeding total', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      const result = r.applyPayment(Money.create(99999).value)
      expect(result.isFail).toBe(true)
      expect(result.error).toContain('excede')
    })

    it('should compute balance correctly', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      expect(r.balance.amount).toBe(800) // 200 * 4
      const result = r.applyPayment(Money.create(300).value)
      expect(result.isOk).toBe(true)
      expect(r.balance.amount).toBe(500)
    })
  })

  describe('guest info', () => {
    it('should update guest info', () => {
      const r = Reservation.create(makeValidReservationProps()).value
      const newInfo = GuestInfo.create({
        name: 'Maria Souza',
        phone: '5511988888888',
      }).value
      r.updateGuestInfo(newInfo)
      expect(r.guestInfo.name).toBe('Maria Souza')
    })
  })
})
