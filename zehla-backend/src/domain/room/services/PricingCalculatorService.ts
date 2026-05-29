import { Result } from '../../shared/Result'
import { MonetaryValue } from '../value-objects/MonetaryValue'
import { RoomDateRange } from '../value-objects/RoomDateRange'
import { RevenueSettings } from '../value-objects/RevenueSettings'
import { PricingRule } from '../entities/PricingRule'
import { RoomType, PricingType } from '../enums'

export interface NightlyPrice {
  date: Date
  basePrice: number
  multiplier: number
  weekendMultiplier: number
  leadTimeDiscount: number
  occupancyMultiplier: number
  finalPrice: number
  appliedRules: string[]
}

export interface StayPriceBreakdown {
  nightlyBreakdown: NightlyPrice[]
  total: number
}

export class PricingCalculatorService {
  getActiveRulesForDate(
    rules: PricingRule[],
    date: Date,
    roomType: RoomType
  ): PricingRule[] {
    return rules.filter(
      (r) => r.isActiveOn(date) && r.appliesTo(roomType)
    )
  }

  calculateNightlyPrice(
    basePrice: MonetaryValue,
    pricingType: PricingType,
    date: Date,
    rules: PricingRule[],
    guestCount: number,
    revenueSettings: RevenueSettings = RevenueSettings.default(),
    occupancyRate: number = 0
  ): Result<MonetaryValue, string> {
    const activeRules = this.getActiveRulesForDate(rules, date, RoomType.STANDARD)
    const rule = activeRules.length > 0 ? activeRules[0] : null

    let price: MonetaryValue
    const appliedRules: string[] = []

    if (rule) {
      const result = rule.applyTo(basePrice)
      if (result.isFail) return Result.fail(result.error)
      price = result.value
      appliedRules.push(rule.name)
    } else {
      price = basePrice
    }

    if (pricingType === PricingType.PER_PERSON && guestCount > 1) {
      price = price.multiply(guestCount)
    }

    if (revenueSettings.dynamicPricingEnabled) {
      const weekendMult = revenueSettings.getWeekendMultiplier(date)
      if (weekendMult > 1.0) {
        price = price.multiply(weekendMult)
        appliedRules.push('weekend')
      }

      const occMult = revenueSettings.getOccupancyMultiplier(occupancyRate)
      if (occMult > 1.0 || (occMult < 1.0 && occMult > 0)) {
        price = price.multiply(occMult)
        appliedRules.push(`occupancy:${occMult}`)
      }
    }

    if (price.amount < basePrice.amount * 0.5) {
      return Result.fail('Preço final não pode ser menor que 50% do preço base')
    }

    const clamped = revenueSettings.applyPriceClamp(price)
    if (clamped.isFail) return Result.fail(clamped.error)

    return Result.ok(clamped.value)
  }

  calculateStayPrice(
    basePrice: MonetaryValue,
    pricingType: PricingType,
    checkIn: Date,
    checkOut: Date,
    rules: PricingRule[],
    guestCount: number,
    revenueSettings: RevenueSettings = RevenueSettings.default(),
    occupancyRate: number = 0
  ): Result<StayPriceBreakdown, string> {
    const rangeResult = RoomDateRange.create(checkIn, checkOut)
    if (rangeResult.isFail) return Result.fail(rangeResult.error)

    const range = rangeResult.value
    const breakdown: NightlyPrice[] = []
    const now = new Date()

    let leadTimeDiscount = 0
    if (revenueSettings.dynamicPricingEnabled) {
      leadTimeDiscount = revenueSettings.getLeadTimeDiscount(checkIn, now)
    }

    for (let i = 0; i < range.nights; i++) {
      const date = new Date(range.startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateRules = this.getActiveRulesForDate(rules, date, RoomType.STANDARD)
      const rule = dateRules.length > 0 ? dateRules[0] : null
      const pricingMultiplier = rule?.multiplier ?? 1.0

      let price: MonetaryValue
      const appliedRules: string[] = []

      if (rule) {
        const result = rule.applyTo(basePrice)
        if (result.isFail) return Result.fail(result.error)
        price = result.value
        appliedRules.push(rule.name)
      } else {
        price = basePrice
      }

      if (pricingType === PricingType.PER_PERSON && guestCount > 1) {
        price = price.multiply(guestCount)
      }

      const weekendMult = revenueSettings.dynamicPricingEnabled
        ? revenueSettings.getWeekendMultiplier(date)
        : 1.0
      if (weekendMult > 1.0) {
        price = price.multiply(weekendMult)
        appliedRules.push('weekend')
      }

      if (leadTimeDiscount > 0) {
        price = price.multiply(1.0 - leadTimeDiscount)
        appliedRules.push(`early_booking:${leadTimeDiscount * 100}%`)
      }

      const occMult = revenueSettings.dynamicPricingEnabled
        ? revenueSettings.getOccupancyMultiplier(occupancyRate)
        : 1.0
      if (occMult > 1.0) {
        price = price.multiply(occMult)
        appliedRules.push(`occupancy:${occMult}`)
      }

      const clamped = revenueSettings.applyPriceClamp(price)
      if (clamped.isFail) return Result.fail(clamped.error)
      price = clamped.value

      breakdown.push({
        date,
        basePrice: basePrice.amount,
        multiplier: pricingMultiplier,
        weekendMultiplier: weekendMult,
        leadTimeDiscount,
        occupancyMultiplier: occMult,
        finalPrice: price.amount,
        appliedRules,
      })
    }

    const total = breakdown.reduce((sum, n) => sum + n.finalPrice, 0)

    return Result.ok({ nightlyBreakdown: breakdown, total })
  }
}
