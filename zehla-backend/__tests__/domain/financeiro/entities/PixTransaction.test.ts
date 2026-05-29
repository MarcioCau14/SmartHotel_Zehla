import { describe, it, expect } from 'vitest'
import { PixTransaction } from '../../../../src/domain/financeiro/entities/PixTransaction'
import { PixKey, PixKeyType } from '../../../../src/domain/financeiro/value-objects/PixKey'
import { Money } from '../../../../src/domain/financeiro/value-objects/Money'
import { PixStatus } from '../../../../src/domain/financeiro/enums'

function createValidPixTransaction() {
  const pixKey = PixKey.create(PixKeyType.EMAIL, 'test@example.com').value
  return PixTransaction.create({
    id: 'pix-1',
    pixKey,
    amount: Money.create(500).value,
    description: 'Pagamento hospedagem',
    qrCode: 'qr-code-base64-data',
    expiresAt: new Date('2099-12-31'),
  }).value
}

describe('PixTransaction', () => {
  describe('create', () => {
    it('should create valid pix transaction as AWAITING_PAYMENT', () => {
      const pix = createValidPixTransaction()
      expect(pix.status).toBe(PixStatus.AWAITING_PAYMENT)
      expect(pix.id).toBe('pix-1')
      expect(pix.amount.amount).toBe(500)
    })

    it('should fail without id', () => {
      const pixKey = PixKey.create(PixKeyType.EMAIL, 'test@example.com').value
      const result = PixTransaction.create({
        id: '',
        pixKey,
        amount: Money.create(500).value,
        description: 'Test',
        qrCode: 'data',
        expiresAt: new Date('2099-12-31'),
      })
      expect(result.isFail).toBe(true)
    })

    it('should fail with zero amount', () => {
      const pixKey = PixKey.create(PixKeyType.EMAIL, 'test@example.com').value
      const result = PixTransaction.create({
        id: 'pix-1',
        pixKey,
        amount: Money.zero(),
        description: 'Test',
        qrCode: 'data',
        expiresAt: new Date('2099-12-31'),
      })
      expect(result.isFail).toBe(true)
    })
  })

  describe('markReceived', () => {
    it('should transition AWAITING_PAYMENT → RECEIVED', () => {
      const pix = createValidPixTransaction()
      const result = pix.markReceived('E2E12345678901234567890')
      expect(result.isOk).toBe(true)
      expect(pix.status).toBe(PixStatus.RECEIVED)
      expect(pix.endToEndId).toBe('E2E12345678901234567890')
    })

    it('should require endToEndId', () => {
      const pix = createValidPixTransaction()
      const result = pix.markReceived('')
      expect(result.isFail).toBe(true)
    })
  })

  describe('confirm', () => {
    it('should transition RECEIVED → CONFIRMED', () => {
      const pix = createValidPixTransaction()
      pix.markReceived('E2E12345678901234567890')
      const result = pix.confirm()
      expect(result.isOk).toBe(true)
      expect(pix.status).toBe(PixStatus.CONFIRMED)
      expect(pix.confirmedAt).toBeInstanceOf(Date)
    })

    it('should fail to confirm from AWAITING_PAYMENT', () => {
      const pix = createValidPixTransaction()
      const result = pix.confirm()
      expect(result.isFail).toBe(true)
    })
  })

  describe('expire', () => {
    it('should transition AWAITING_PAYMENT → EXPIRED', () => {
      const pix = createValidPixTransaction()
      const result = pix.expire()
      expect(result.isOk).toBe(true)
      expect(pix.status).toBe(PixStatus.EXPIRED)
    })

    it('should fail to expire from RECEIVED', () => {
      const pix = createValidPixTransaction()
      pix.markReceived('E2E123456')
      const result = pix.expire()
      expect(result.isFail).toBe(true)
    })
  })

  describe('isExpired', () => {
    it('should return true when status is EXPIRED', () => {
      const pix = createValidPixTransaction()
      pix.expire()
      expect(pix.isExpired()).toBe(true)
    })

    it('should return false when status is AWAITING_PAYMENT', () => {
      const pix = createValidPixTransaction()
      expect(pix.isExpired()).toBe(false)
    })
  })

  describe('invalid transitions', () => {
    it('should fail to confirm EXPIRED transaction', () => {
      const pix = createValidPixTransaction()
      pix.expire()
      const result = pix.confirm()
      expect(result.isFail).toBe(true)
    })

    it('should fail to mark received after expiry', () => {
      const pix = createValidPixTransaction()
      pix.expire()
      const result = pix.markReceived('E2E123456')
      expect(result.isFail).toBe(true)
    })
  })

  describe('refund', () => {
    it('should transition CONFIRMED → REFUNDED', () => {
      const pix = createValidPixTransaction()
      pix.markReceived('E2E123456')
      pix.confirm()
      const result = pix.refund()
      expect(result.isOk).toBe(true)
      expect(pix.status).toBe(PixStatus.REFUNDED)
    })

    it('should fail to refund from RECEIVED', () => {
      const pix = createValidPixTransaction()
      pix.markReceived('E2E123456')
      const result = pix.refund()
      expect(result.isFail).toBe(true)
    })
  })
})
