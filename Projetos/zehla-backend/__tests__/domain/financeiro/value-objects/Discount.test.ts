import { describe, it, expect } from 'vitest'
import { Discount } from '../../../../src/domain/financeiro/value-objects/Discount'
import { DiscountType } from '../../../../src/domain/financeiro/enums'
import { Money } from '../../../../src/domain/financeiro/value-objects/Money'

describe('Discount', () => {
  it('should create valid percentage discount', () => {
    const result = Discount.create({
      type: DiscountType.PERCENTAGE,
      percentage: 10,
      reason: 'Promotional discount',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.type).toBe(DiscountType.PERCENTAGE)
    expect(result.value.percentage).toBe(10)
  })

  it('should create valid fixed discount', () => {
    const value = Money.create(50).value
    const result = Discount.create({
      type: DiscountType.FIXED,
      value,
      reason: 'Loyalty discount',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.type).toBe(DiscountType.FIXED)
    expect(result.value.value.amount).toBe(50)
  })

  it('should fail with percentage out of range', () => {
    const result = Discount.create({
      type: DiscountType.PERCENTAGE,
      percentage: 150,
      reason: 'Invalid discount',
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with negative percentage', () => {
    const result = Discount.create({
      type: DiscountType.PERCENTAGE,
      percentage: -5,
      reason: 'Invalid discount',
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with empty reason', () => {
    const result = Discount.create({
      type: DiscountType.PERCENTAGE,
      percentage: 10,
      reason: '',
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with short reason', () => {
    const result = Discount.create({
      type: DiscountType.PERCENTAGE,
      percentage: 10,
      reason: 'AB',
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with fixed discount of zero', () => {
    const result = Discount.create({
      type: DiscountType.FIXED,
      value: Money.zero(),
      reason: 'Zero discount',
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail missing percentage for percentage type', () => {
    const result = Discount.create({
      type: DiscountType.PERCENTAGE,
      reason: 'Missing percentage',
    })
    expect(result.isFail).toBe(true)
  })
})
