import { describe, it, expect } from 'vitest'
import { InvoiceNumber } from '../../../../src/domain/financeiro/value-objects/InvoiceNumber'

describe('InvoiceNumber', () => {
  it('should create from valid format string', () => {
    const result = InvoiceNumber.create('INV-202603-000001')
    expect(result.isOk).toBe(true)
    expect(result.value.value).toBe('INV-202603-000001')
  })

  it('should generate valid invoice number', () => {
    const result = InvoiceNumber.generate(3, 2026, 1)
    expect(result.isOk).toBe(true)
    expect(result.value.value).toBe('INV-202603-000001')
  })

  it('should generate with correct padding', () => {
    const result = InvoiceNumber.generate(12, 2026, 999)
    expect(result.isOk).toBe(true)
    expect(result.value.value).toBe('INV-202612-000999')
  })

  it('should fail with invalid format', () => {
    const result = InvoiceNumber.create('INV-abc-123')
    expect(result.isFail).toBe(true)
  })

  it('should fail with empty string', () => {
    const result = InvoiceNumber.create('')
    expect(result.isFail).toBe(true)
  })

  it('should fail with invalid month', () => {
    const result = InvoiceNumber.generate(13, 2026, 1)
    expect(result.isFail).toBe(true)
  })

  it('should fail with invalid year', () => {
    const result = InvoiceNumber.generate(1, 1999, 1)
    expect(result.isFail).toBe(true)
  })

  it('should fail with invalid sequential', () => {
    const result = InvoiceNumber.generate(1, 2026, 0)
    expect(result.isFail).toBe(true)
  })

  it('should get month from invoice number', () => {
    const result = InvoiceNumber.create('INV-202611-000001')
    expect(result.value.getMonth()).toBe(11)
  })

  it('should get year from invoice number', () => {
    const result = InvoiceNumber.create('INV-202611-000001')
    expect(result.value.getYear()).toBe(2026)
  })

  it('should get sequential from invoice number', () => {
    const result = InvoiceNumber.create('INV-202611-000042')
    expect(result.value.getSequential()).toBe(42)
  })

  it('should check equality', () => {
    const a = InvoiceNumber.create('INV-202603-000001').value
    const b = InvoiceNumber.create('INV-202603-000001').value
    expect(a.equals(b)).toBe(true)
  })
})
