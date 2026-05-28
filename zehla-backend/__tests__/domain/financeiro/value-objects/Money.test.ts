import { describe, it, expect } from 'vitest'
import { Money } from '../../../../src/domain/financeiro/value-objects/Money'

describe('Money', () => {
  it('should create valid money with default BRL', () => {
    const m = Money.create(100.50)
    expect(m.isOk).toBe(true)
    expect(m.value.amount).toBe(100.50)
    expect(m.value.currency).toBe('BRL')
  })

  it('should create with custom currency', () => {
    const m = Money.create(50, 'USD')
    expect(m.isOk).toBe(true)
    expect(m.value.currency).toBe('USD')
  })

  it('should round to 2 decimal places', () => {
    const m = Money.create(10.999)
    expect(m.isOk).toBe(true)
    expect(m.value.amount).toBe(11.00)
  })

  it('should fail with negative amount', () => {
    const m = Money.create(-50)
    expect(m.isFail).toBe(true)
    expect(m.error).toContain('negative')
  })

  it('should fail with NaN', () => {
    const m = Money.create(NaN)
    expect(m.isFail).toBe(true)
  })

  it('should fail with invalid currency', () => {
    const m = Money.create(100, 'BRL123')
    expect(m.isFail).toBe(true)
    expect(m.error).toContain('ISO 4217')
  })

  it('should fail with empty currency', () => {
    const m = Money.create(100, '')
    expect(m.isFail).toBe(true)
  })

  it('should add same currency correctly', () => {
    const a = Money.create(100).value
    const b = Money.create(50).value
    const result = a.add(b)
    expect(result.isOk).toBe(true)
    expect(result.value.amount).toBe(150)
  })

  it('should fail add with different currencies', () => {
    const result = Money.create(100, 'USD').value.add(Money.create(50, 'BRL').value)
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('different currencies')
  })

  it('should subtract correctly', () => {
    const result = Money.create(100).value.subtract(Money.create(30).value)
    expect(result.isOk).toBe(true)
    expect(result.value.amount).toBe(70)
  })

  it('should fail subtract when insufficient', () => {
    const result = Money.create(30).value.subtract(Money.create(100).value)
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Insufficient')
  })

  it('should multiply correctly', () => {
    const m = Money.create(150).value
    const result = m.multiply(3)
    expect(result.amount).toBe(450)
  })

  it('should return zero for negative multiplier', () => {
    const m = Money.create(100).value
    expect(m.multiply(-1).amount).toBe(0)
  })

  it('should calculate percentage', () => {
    const m = Money.create(200).value
    const result = m.percentage(10)
    expect(result.amount).toBe(20)
  })

  it('should return zero for out of range percentage', () => {
    const m = Money.create(100).value
    expect(m.percentage(-1).amount).toBe(0)
    expect(m.percentage(101).amount).toBe(0)
  })

  it('should compare greater than', () => {
    const a = Money.create(100).value
    const b = Money.create(50).value
    expect(a.isGreaterThan(b)).toBe(true)
    expect(b.isGreaterThan(a)).toBe(false)
  })

  it('should detect zero', () => {
    expect(Money.zero().isZero()).toBe(true)
    expect(Money.create(1).value.isZero()).toBe(false)
  })

  it('should check equality', () => {
    const a = Money.create(100).value
    const b = Money.create(100).value
    const c = Money.create(100, 'USD').value
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('should convert to number', () => {
    const m = Money.create(99.90).value
    expect(m.toNumber()).toBe(99.90)
  })

  it('should round 1.235 to 1.24', () => {
    const m = Money.create(1.235)
    expect(m.isOk).toBe(true)
    expect(m.value.amount).toBe(1.24)
  })
})
