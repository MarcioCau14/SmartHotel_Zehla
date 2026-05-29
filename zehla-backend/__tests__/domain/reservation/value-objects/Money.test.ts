import { describe, it, expect } from 'vitest'
import { Money } from '../../../../src/domain/reservation/value-objects/Money'

describe('Money', () => {
  it('should create valid money', () => {
    const m = Money.create(100.50)
    expect(m.isOk).toBe(true)
    expect(m.value.amount).toBe(100.50)
  })

  it('should round to 2 decimal places', () => {
    const m = Money.create(10.999)
    expect(m.isOk).toBe(true)
    expect(m.value.amount).toBe(11.00)
  })

  it('should fail with negative amount', () => {
    const m = Money.create(-50)
    expect(m.isFail).toBe(true)
    expect(m.error).toContain('negativo')
  })

  it('should fail with NaN', () => {
    const m = Money.create(NaN)
    expect(m.isFail).toBe(true)
  })

  it('should add correctly', () => {
    const a = Money.create(100).value
    const b = Money.create(50).value
    const result = a.add(b)
    expect(result.amount).toBe(150)
  })

  it('should subtract correctly', () => {
    const result = Money.create(100).value.subtract(Money.create(30).value)
    expect(result.isOk).toBe(true)
    expect(result.value.amount).toBe(70)
  })

  it('should fail subtract when insufficient', () => {
    const result = Money.create(30).value.subtract(Money.create(100).value)
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('insuficiente')
  })

  it('should multiply correctly', () => {
    const m = Money.create(150).value
    const result = m.multiply(3)
    expect(result.amount).toBe(450)
  })

  it('should return ZERO for negative multiplier', () => {
    const m = Money.create(100).value
    expect(m.multiply(-1).amount).toBe(0)
  })

  it('should detect zero', () => {
    expect(Money.ZERO.isZero()).toBe(true)
    expect(Money.create(1).value.isZero()).toBe(false)
  })
})
