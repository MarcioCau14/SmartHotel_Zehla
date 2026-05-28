import { Result } from '../../../domain/shared/Result'
import { MonetaryValue } from '../../../domain/room/value-objects/MonetaryValue'
import { RevenueSettings } from '../../../domain/room/value-objects/RevenueSettings'
import { PricingCalculatorService, StayPriceBreakdown } from '../../../domain/room/services/PricingCalculatorService'
import { IRoomRepository } from '../ports/IRoomRepository'
import { IPricingRuleRepository } from '../ports/IPricingRuleRepository'
import { IRevenueSettingsRepository } from '../ports/IRevenueSettingsRepository'

export interface CalculateStayPriceInput {
  roomId: string
  checkIn: string
  checkOut: string
  guestCount?: number
  occupancyRate?: number
}

export interface NightlyBreakdownOutput {
  date: string
  basePrice: number
  multiplier: number
  weekendMultiplier: number
  leadTimeDiscount: number
  occupancyMultiplier: number
  finalPrice: number
  appliedRules: string[]
}

export interface CalculateStayPriceOutput {
  roomNumber: string
  nightlyBreakdown: NightlyBreakdownOutput[]
  total: number
}

export class CalculateStayPriceUseCase {
  constructor(
    private roomRepo: IRoomRepository,
    private ruleRepo: IPricingRuleRepository,
    private revenueRepo: IRevenueSettingsRepository,
    private pricingCalculator: PricingCalculatorService
  ) {}

  async execute(input: CalculateStayPriceInput): Promise<Result<CalculateStayPriceOutput, string>> {
    const room = await this.roomRepo.findById(input.roomId)
    if (!room) return Result.fail('Quarto não encontrado')

    const checkIn = new Date(input.checkIn)
    const checkOut = new Date(input.checkOut)
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return Result.fail('Datas inválidas')
    }

    if (checkOut <= checkIn) {
      return Result.fail('checkOut deve ser posterior a checkIn')
    }

    const [rules, revenueSettings] = await Promise.all([
      this.ruleRepo.findByProperty(room.propertyId),
      this.revenueRepo.findByPropertyId(room.propertyId),
    ])

    const guestCount = input.guestCount ?? 1
    const result = this.pricingCalculator.calculateStayPrice(
      room.basePrice,
      room.pricingType,
      checkIn,
      checkOut,
      rules,
      guestCount,
      revenueSettings ?? RevenueSettings.default(),
      input.occupancyRate ?? 0
    )
    if (result.isFail) return Result.fail(result.error)

    const breakdown = result.value

    return Result.ok({
      roomNumber: room.number,
      nightlyBreakdown: breakdown.nightlyBreakdown.map((n) => ({
        date: n.date.toISOString().split('T')[0],
        basePrice: n.basePrice,
        multiplier: n.multiplier,
        weekendMultiplier: n.weekendMultiplier,
        leadTimeDiscount: n.leadTimeDiscount,
        occupancyMultiplier: n.occupancyMultiplier,
        finalPrice: n.finalPrice,
        appliedRules: n.appliedRules,
      })),
      total: breakdown.total,
    })
  }
}
