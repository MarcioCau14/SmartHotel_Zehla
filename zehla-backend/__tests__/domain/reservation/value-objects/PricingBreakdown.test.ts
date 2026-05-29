import { describe, it, expect } from 'vitest'
import { Money } from '../../../../src/domain/reservation/value-objects/Money'
import { PricingBreakdown } from '../../../../src/domain/reservation/value-objects/PricingBreakdown'

describe('PricingBreakdown', () => {
  it('should create a valid pricing breakdown', () => {
    const roomPrice = Money.create(200).value
    const discount = Money.create(50).value
    const result = PricingBreakdown.create({ roomPrice, nights: 3, discount })

    expect(result.isOk).toBe(true)
    expect(result.value.subtotal.amount).toBe(600)
    expect(result.value.total.amount).toBe(550)
  })

  it('should fail with 0 nights', () => {
    const result = PricingBreakdown.create({
      roomPrice: Money.create(200).value,
      nights: 0,
      discount: Money.ZERO,
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail when discount exceeds total', () => {
    const result = PricingBreakdown.create({
      roomPrice: Money.create(200).value,
      nights: 1,
      discount: Money.create(300).value,
    })
    expect(result.isFail).toBe(true)
  })

  it('should include pricing rules', () => {
    const result = PricingBreakdown.create({
      roomPrice: Money.create(150).value,
      nights: 2,
      discount: Money.ZERO,
      pricingRulesApplied: [
        { ruleId: 'r1', name: 'Alta Temporada', type: 'multiplier', value: 1.5 },
      ],
    })
    expect(result.isOk).toBe(true)
    expect(result.value.pricingRulesApplied).toHaveLength(1)
  })
})
