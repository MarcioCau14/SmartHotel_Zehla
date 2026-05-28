import { describe, it, expect } from 'vitest'
import { MonetaryValue } from '../../../../src/domain/room/value-objects/MonetaryValue'

describe('MonetaryValue', () => {
  it('should create valid monetary value', () => {
    const m = MonetaryValue.create(100.50)
    expect(m.isOk).toBe(true)
    expect(m.value.amount).toBe(100.50)
    expect(m.value.currency).toBe('BRL')
  })

  it('should accept custom currency', () => {
    const m = MonetaryValue.create(50, 'USD')
    expect(m.isOk).toBe(true)
    expect(m.value.currency).toBe('USD')
  })

  it('should round to 2 decimal places', () => {
    const m = MonetaryValue.create(10.999)
    expect(m.isOk).toBe(true)
    expect(m.value.amount).toBe(11.00)
  })

  it('should fail with negative amount', () => {
    const m = MonetaryValue.create(-50)
    expect(m.isFail).toBe(true)
    expect(m.error).toContain('negativo')
  })

  it('should fail with NaN', () => {
    const m = MonetaryValue.create(NaN)
    expect(m.isFail).toBe(true)
  })

  it('should fail with invalid currency', () => {
    const m = MonetaryValue.create(100, 'BRL123')
    expect(m.isFail).toBe(true)
    expect(m.error).toContain('ISO 4217')
  })

  it('should fail with empty currency', () => {
    const m = MonetaryValue.create(100, '')
    expect(m.isFail).toBe(true)
  })

  it('should add same currency correctly', () => {
    const a = MonetaryValue.create(100).value
    const b = MonetaryValue.create(50).value
    const result = a.add(b)
    expect(result.isOk).toBe(true)
    expect(result.value.amount).toBe(150)
  })

  it('should fail add with different currencies', () => {
    const result = MonetaryValue.create(100, 'USD').value.add(MonetaryValue.create(50, 'BRL').value)
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Moedas diferentes')
  })

  it('should subtract correctly', () => {
    const result = MonetaryValue.create(100).value.subtract(MonetaryValue.create(30).value)
    expect(result.isOk).toBe(true)
    expect(result.value.amount).toBe(70)
  })

  it('should fail subtract when insufficient', () => {
    const result = MonetaryValue.create(30).value.subtract(MonetaryValue.create(100).value)
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('insuficiente')
  })

  it('should multiply correctly', () => {
    const m = MonetaryValue.create(150).value
    const result = m.multiply(3)
    expect(result.amount).toBe(450)
  })

  it('should return ZERO for negative multiplier', () => {
    const m = MonetaryValue.create(100).value
    expect(m.multiply(-1).amount).toBe(0)
  })

  it('should detect zero', () => {
    expect(MonetaryValue.ZERO.isZero()).toBe(true)
    expect(MonetaryValue.create(1).value.isZero()).toBe(false)
  })

  it('should serialize to JSON', () => {
    const m = MonetaryValue.create(99.90).value
    expect(m.toJSON()).toEqual({ amount: 99.90, currency: 'BRL' })
  })
})
