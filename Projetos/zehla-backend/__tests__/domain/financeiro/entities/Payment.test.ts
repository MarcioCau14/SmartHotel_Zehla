import { describe, it, expect } from 'vitest'
import { Payment } from '../../../../src/domain/financeiro/entities/Payment'
import { PixTransaction } from '../../../../src/domain/financeiro/entities/PixTransaction'
import { Money } from '../../../../src/domain/financeiro/value-objects/Money'
import { PixKey, PixKeyType } from '../../../../src/domain/financeiro/value-objects/PixKey'
import { PaymentStatus, PaymentMethod } from '../../../../src/domain/financeiro/enums'

function createValidPixTransaction() {
  const pixKey = PixKey.create(PixKeyType.EMAIL, 'test@example.com').value
  return PixTransaction.create({
    id: 'pix-1',
    pixKey,
    amount: Money.create(500).value,
    description: 'Pagamento hospedagem',
    qrCode: 'qr-code-data',
    expiresAt: new Date('2026-04-01'),
  }).value
}

function createValidPayment(overrides: Partial<{ id: string; invoiceId: string; method: PaymentMethod; amount: Money; pixTransaction: PixTransaction }> = {}) {
  return Payment.create({
    id: overrides.id ?? 'pay-1',
    invoiceId: overrides.invoiceId ?? 'inv-1',
    method: overrides.method ?? PaymentMethod.PIX,
    amount: overrides.amount ?? Money.create(500).value,
    pixTransaction: overrides.pixTransaction ?? createValidPixTransaction(),
  }).value
}

describe('Payment', () => {
  describe('create', () => {
    it('should create valid payment as PENDING', () => {
      const pay = createValidPayment()
      expect(pay.status).toBe(PaymentStatus.PENDING)
      expect(pay.id).toBe('pay-1')
      expect(pay.method).toBe(PaymentMethod.PIX)
    })

    it('should fail without id', () => {
      const pix = createValidPixTransaction()
      const result = Payment.create({ id: '', invoiceId: 'inv-1', method: PaymentMethod.PIX, amount: Money.create(500).value, pixTransaction: pix })
      expect(result.isFail).toBe(true)
    })

    it('should fail with zero amount', () => {
      const pix = createValidPixTransaction()
      const result = Payment.create({ id: 'pay-1', invoiceId: 'inv-1', method: PaymentMethod.PIX, amount: Money.zero(), pixTransaction: pix })
      expect(result.isFail).toBe(true)
    })

    it('should require pix transaction for PIX method', () => {
      const result = Payment.create({ id: 'pay-1', invoiceId: 'inv-1', method: PaymentMethod.PIX, amount: Money.create(500).value })
      expect(result.isFail).toBe(true)
    })
  })

  describe('initiate', () => {
    it('should transition PENDING → PROCESSING', () => {
      const pay = createValidPayment()
      const result = pay.initiate()
      expect(result.isOk).toBe(true)
      expect(pay.status).toBe(PaymentStatus.PROCESSING)
    })

    it('should fail to initiate from PROCESSING', () => {
      const pay = createValidPayment()
      pay.initiate()
      const result = pay.initiate()
      expect(result.isFail).toBe(true)
    })
  })

  describe('confirm', () => {
    it('should transition PROCESSING → CONFIRMED', () => {
      const pay = createValidPayment()
      pay.initiate()
      const result = pay.confirm('gateway-txn-123')
      expect(result.isOk).toBe(true)
      expect(pay.status).toBe(PaymentStatus.CONFIRMED)
      expect(pay.gatewayTransactionId).toBe('gateway-txn-123')
    })

    it('should fail to confirm from PENDING', () => {
      const pay = createValidPayment()
      const result = pay.confirm('gateway-txn-123')
      expect(result.isFail).toBe(true)
    })

    it('should require gateway transaction id', () => {
      const pay = createValidPayment()
      pay.initiate()
      const result = pay.confirm('')
      expect(result.isFail).toBe(true)
    })
  })

  describe('fail', () => {
    it('should transition PROCESSING → FAILED', () => {
      const pay = createValidPayment()
      pay.initiate()
      const result = pay.fail('Insufficient funds')
      expect(result.isOk).toBe(true)
      expect(pay.status).toBe(PaymentStatus.FAILED)
      expect(pay.failureReason).toBe('Insufficient funds')
    })

    it('should require failure reason', () => {
      const pay = createValidPayment()
      pay.initiate()
      const result = pay.fail('')
      expect(result.isFail).toBe(true)
    })
  })

  describe('refund', () => {
    it('should transition CONFIRMED → REFUNDED', () => {
      const pay = createValidPayment()
      pay.initiate()
      pay.confirm('gateway-txn-123')
      const result = pay.refund()
      expect(result.isOk).toBe(true)
      expect(pay.status).toBe(PaymentStatus.REFUNDED)
    })

    it('should fail to refund from FAILED status', () => {
      const pay = createValidPayment()
      pay.initiate()
      pay.fail('Error')
      const result = pay.refund()
      expect(result.isFail).toBe(true)
    })
  })

  describe('cancel', () => {
    it('should transition PENDING → CANCELLED', () => {
      const pay = createValidPayment()
      const result = pay.cancel()
      expect(result.isOk).toBe(true)
      expect(pay.status).toBe(PaymentStatus.CANCELLED)
    })

    it('should transition PROCESSING → CANCELLED', () => {
      const pay = createValidPayment()
      pay.initiate()
      const result = pay.cancel()
      expect(result.isOk).toBe(true)
      expect(pay.status).toBe(PaymentStatus.CANCELLED)
    })

    it('should fail to cancel from CONFIRMED', () => {
      const pay = createValidPayment()
      pay.initiate()
      pay.confirm('txn-123')
      const result = pay.cancel()
      expect(result.isFail).toBe(true)
    })
  })
})
