import { describe, it, expect } from 'vitest'
import { TransactionReference } from '../../../../src/domain/financeiro/value-objects/TransactionReference'
import { TransactionType } from '../../../../src/domain/financeiro/enums'

describe('TransactionReference', () => {
  it('should create valid transaction reference', () => {
    const result = TransactionReference.create({
      externalId: 'ext-123',
      internalId: 'int-456',
      type: TransactionType.PAYMENT,
    })
    expect(result.isOk).toBe(true)
    expect(result.value.externalId).toBe('ext-123')
    expect(result.value.internalId).toBe('int-456')
    expect(result.value.type).toBe(TransactionType.PAYMENT)
  })

  it('should fail with empty externalId', () => {
    const result = TransactionReference.create({
      externalId: '',
      internalId: 'int-456',
      type: TransactionType.PAYMENT,
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with empty internalId', () => {
    const result = TransactionReference.create({
      externalId: 'ext-123',
      internalId: '',
      type: TransactionType.PAYMENT,
    })
    expect(result.isFail).toBe(true)
  })

  it('should trim whitespace', () => {
    const result = TransactionReference.create({
      externalId: '  ext-123  ',
      internalId: '  int-456  ',
      type: TransactionType.REFUND,
    })
    expect(result.isOk).toBe(true)
    expect(result.value.externalId).toBe('ext-123')
    expect(result.value.internalId).toBe('int-456')
    expect(result.value.type).toBe(TransactionType.REFUND)
  })
})
