import { describe, it, expect } from 'vitest'
import { Payment } from '../../../../src/domain/reservation/entities/Payment'
import { Money } from '../../../../src/domain/reservation/value-objects/Money'
import { PaymentMethod } from '../../../../src/domain/reservation/PaymentMethod'
import { PaymentStatus } from '../../../../src/domain/reservation/PaymentStatus'

describe('Payment', () => {
  it('should create a pending payment', () => {
    const p = Payment.create({
      id: 'pay-1',
      reservationId: 'res-1',
      propertyId: 'prop-1',
      amount: Money.create(500).value,
      method: PaymentMethod.PIX,
    })
    expect(p.isOk).toBe(true)
    expect(p.value.status).toBe(PaymentStatus.PENDING)
  })

  it('should fail with zero amount', () => {
    const p = Payment.create({
      id: 'pay-1',
      reservationId: 'res-1',
      propertyId: 'prop-1',
      amount: Money.ZERO,
      method: PaymentMethod.PIX,
    })
    expect(p.isFail).toBe(true)
  })

  it('should confirm payment', () => {
    const p = Payment.create({
      id: 'pay-1',
      reservationId: 'res-1',
      propertyId: 'prop-1',
      amount: Money.create(500).value,
      method: PaymentMethod.PIX,
    }).value

    const result = p.confirm()
    expect(result.isOk).toBe(true)
    expect(p.status).toBe(PaymentStatus.PAID)
    expect(p.paidAt).toBeDefined()
  })

  it('should emit event on confirm', () => {
    const p = Payment.create({
      id: 'pay-1',
      reservationId: 'res-1',
      propertyId: 'prop-1',
      amount: Money.create(500).value,
      method: PaymentMethod.CREDIT_CARD,
    }).value

    p.confirm()
    expect(p.events).toHaveLength(1)
    expect(p.events[0].eventName).toBe('PaymentConfirmed')
    expect(p.events[0].payload.method).toBe('CREDIT_CARD')
  })

  it('should not confirm already confirmed payment', () => {
    const p = Payment.create({
      id: 'pay-1',
      reservationId: 'res-1',
      propertyId: 'prop-1',
      amount: Money.create(500).value,
      method: PaymentMethod.PIX,
    }).value
    p.confirm()
    const result = p.confirm()
    expect(result.isFail).toBe(true)
  })

  it('should refund a paid payment', () => {
    const p = Payment.create({
      id: 'pay-1',
      reservationId: 'res-1',
      propertyId: 'prop-1',
      amount: Money.create(500).value,
      method: PaymentMethod.PIX,
    }).value
    p.confirm()
    const result = p.refund()
    expect(result.isOk).toBe(true)
    expect(p.status).toBe(PaymentStatus.REFUNDED)
  })

  it('should mark as failed', () => {
    const p = Payment.create({
      id: 'pay-1',
      reservationId: 'res-1',
      propertyId: 'prop-1',
      amount: Money.create(500).value,
      method: PaymentMethod.PIX,
    }).value
    p.fail()
    expect(p.status).toBe(PaymentStatus.FAILED)
  })
})
