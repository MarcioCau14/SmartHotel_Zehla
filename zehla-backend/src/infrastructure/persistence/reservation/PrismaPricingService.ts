import { PrismaClient } from '@prisma/client'
import { Money } from '../../../domain/reservation/value-objects/Money'
import { PricingBreakdown } from '../../../domain/reservation/value-objects/PricingBreakdown'
import { DateRange } from '../../../domain/reservation/value-objects/DateRange'
import { IPricingService, PricingRuleData } from '../../../application/reservation/ports/IPricingService'
import { RoomType } from '../../../application/reservation/ports/IRoomRepository'

export class PrismaPricingService implements IPricingService {
  constructor(private prisma: PrismaClient) {}

  async calculatePrice(
    basePrice: Money,
    nights: number,
    _guestCount: number,
    roomType: RoomType,
    propertyId: string,
    period: DateRange
  ): Promise<PricingBreakdown> {
    const rules = await this.findActiveRules(propertyId, roomType, period)

    let effectiveMultiplier = 1.0
    let effectiveFixed: number | null = null

    for (const rule of rules) {
      if (rule.fixedAmount !== null) {
        effectiveFixed = rule.fixedAmount
      } else {
        effectiveMultiplier *= rule.multiplier
      }
    }

    let finalPrice = basePrice
    if (effectiveFixed !== null) {
      const fixedMoney = Money.create(effectiveFixed)
      if (fixedMoney.isOk) finalPrice = fixedMoney.value
    } else {
      finalPrice = basePrice.multiply(effectiveMultiplier)
    }

    const discount = Money.ZERO
    const pricing = PricingBreakdown.create({
      roomPrice: finalPrice,
      nights,
      discount,
      pricingRulesApplied: rules.map((r) => ({
        ruleId: r.id,
        name: r.id,
        type: r.fixedAmount !== null ? 'fixed' : 'multiplier',
        value: r.fixedAmount ?? r.multiplier,
      })),
    })

    return pricing.getOrElse(
      PricingBreakdown.create({ roomPrice: basePrice, nights, discount: Money.ZERO }).value
    )
  }

  async findActiveRules(propertyId: string, roomType: RoomType, period: DateRange): Promise<PricingRuleData[]> {
    const rows = await this.prisma.pricingRule.findMany({
      where: {
        propertyId,
        isActive: true,
        startDate: { lte: period.checkOut },
        endDate: { gte: period.checkIn },
        OR: [{ roomType: roomType as any }, { roomType: null }],
      },
    })
    return rows.map((r) => ({
      id: r.id,
      roomType: r.roomType as RoomType | null,
      startDate: r.startDate,
      endDate: r.endDate,
      multiplier: r.multiplier,
      fixedAmount: r.fixedAmount,
      isActive: r.isActive,
    }))
  }
}
