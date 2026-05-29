import { describe, it, expect } from 'vitest'
import { RevenueSettings } from '../../../../src/domain/room/value-objects/RevenueSettings'
import { MonetaryValue } from '../../../../src/domain/room/value-objects/MonetaryValue'

function utcDate(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d))
}

describe('RevenueSettings', () => {
  describe('create', () => {
    it('should create default settings', () => {
      const s = RevenueSettings.default()
      expect(s.dynamicPricingEnabled).toBe(false)
      expect(s.weekendMultiplier).toBe(1.10)
      expect(s.minPrice).toBeNull()
      expect(s.maxPrice).toBeNull()
    })

    it('should create with custom values', () => {
      const s = RevenueSettings.create({
        dynamicPricingEnabled: true,
        minPrice: 100,
        maxPrice: 1000,
        weekendMultiplier: 1.50,
      })
      expect(s.isOk).toBe(true)
      expect(s.value.weekendMultiplier).toBe(1.50)
      expect(s.value.minPrice).toBe(100)
    })

    it('should reject weekendMultiplier < 1.0', () => {
      const s = RevenueSettings.create({ weekendMultiplier: 0.9 })
      expect(s.isFail).toBe(true)
    })

    it('should reject seasonalMultiplier < 1.0', () => {
      const s = RevenueSettings.create({ seasonalMultiplier: 0.8 })
      expect(s.isFail).toBe(true)
    })

    it('should reject minPrice > maxPrice', () => {
      const s = RevenueSettings.create({ minPrice: 500, maxPrice: 100 })
      expect(s.isFail).toBe(true)
    })
  })

  describe('weekend detection', () => {
    it('should detect Friday as weekend', () => {
      const s = RevenueSettings.default()
      expect(s.isWeekend(utcDate(2025, 6, 6))).toBe(true) // Friday
    })

    it('should detect Saturday as weekend', () => {
      const s = RevenueSettings.default()
      expect(s.isWeekend(utcDate(2025, 6, 7))).toBe(true) // Saturday
    })

    it('should not detect Monday as weekend', () => {
      const s = RevenueSettings.default()
      expect(s.isWeekend(utcDate(2025, 6, 2))).toBe(false) // Monday
    })

    it('should return weekend multiplier for weekend dates', () => {
      const s = RevenueSettings.create({ weekendMultiplier: 2.0 }).value
      expect(s.getWeekendMultiplier(utcDate(2025, 6, 6))).toBe(2.0) // Friday
      expect(s.getWeekendMultiplier(utcDate(2025, 6, 2))).toBe(1.0) // Monday
    })
  })

  describe('lead time discounts', () => {
    it('should return 0 when dynamic pricing is disabled', () => {
      const s = RevenueSettings.create({
        dynamicPricingEnabled: false,
        leadTimeDiscounts: [{ daysBefore: 30, discount: 0.15 }],
      }).value
      const checkIn = utcDate(2025, 8, 1)
      const today = utcDate(2025, 6, 1)
      expect(s.getLeadTimeDiscount(checkIn, today)).toBe(0)
    })

    it('should apply discount based on days before check-in', () => {
      const s = RevenueSettings.create({
        dynamicPricingEnabled: true,
        leadTimeDiscounts: [
          { daysBefore: 60, discount: 0.20 },
          { daysBefore: 30, discount: 0.10 },
        ],
      }).value
      const checkIn = utcDate(2025, 8, 1)

      expect(s.getLeadTimeDiscount(checkIn, utcDate(2025, 5, 1))).toBe(0.20)
      expect(s.getLeadTimeDiscount(checkIn, utcDate(2025, 7, 1))).toBe(0.10)
      expect(s.getLeadTimeDiscount(checkIn, utcDate(2025, 7, 15))).toBe(0)
      expect(s.getLeadTimeDiscount(checkIn, utcDate(2025, 8, 1))).toBe(0)
    })

  it('should return 0 if check-in is in the past', () => {
    const s = RevenueSettings.create({
      dynamicPricingEnabled: true,
      leadTimeDiscounts: [{ daysBefore: 7, discount: 0.10 }],
    }).value
    expect(s.getLeadTimeDiscount(utcDate(2025, 5, 1), utcDate(2025, 8, 1))).toBe(0)
  })
  })

  describe('occupancy thresholds', () => {
    it('should return 1.0 when dynamic pricing disabled', () => {
      const s = RevenueSettings.create({
        dynamicPricingEnabled: false,
        occupancyThresholds: [{ minOccupancy: 0.8, multiplier: 1.5 }],
      }).value
      expect(s.getOccupancyMultiplier(0.9)).toBe(1.0)
    })

    it('should apply surge pricing at high occupancy', () => {
      const s = RevenueSettings.create({
        dynamicPricingEnabled: true,
        occupancyThresholds: [
          { minOccupancy: 0.8, multiplier: 1.5 },
          { minOccupancy: 0.5, multiplier: 1.2 },
        ],
      }).value
      expect(s.getOccupancyMultiplier(0.9)).toBe(1.5)
      expect(s.getOccupancyMultiplier(0.7)).toBe(1.2)
      expect(s.getOccupancyMultiplier(0.3)).toBe(1.0)
    })
  })

  describe('price clamping', () => {
    it('should clamp price to minPrice', () => {
      const s = RevenueSettings.create({ minPrice: 100 }).value
      const result = s.applyPriceClamp(MonetaryValue.create(50).value)
      expect(result.isOk).toBe(true)
      expect(result.value.amount).toBe(100)
    })

    it('should clamp price to maxPrice', () => {
      const s = RevenueSettings.create({ maxPrice: 500 }).value
      const result = s.applyPriceClamp(MonetaryValue.create(1000).value)
      expect(result.isOk).toBe(true)
      expect(result.value.amount).toBe(500)
    })

    it('should keep price unchanged within bounds', () => {
      const s = RevenueSettings.create({ minPrice: 100, maxPrice: 500 }).value
      const result = s.applyPriceClamp(MonetaryValue.create(250).value)
      expect(result.isOk).toBe(true)
      expect(result.value.amount).toBe(250)
    })
  })
})
