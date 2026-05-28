import { Result } from '../../../domain/shared/Result'
import { PricingRule } from '../../../domain/room/entities/PricingRule'
import { MonetaryValue } from '../../../domain/room/value-objects/MonetaryValue'
import { RoomDateRange } from '../../../domain/room/value-objects/RoomDateRange'
import { RoomType } from '../../../domain/room/enums'
import { IPricingRuleRepository } from '../ports/IPricingRuleRepository'

export interface CreatePricingRuleInput {
  name: string
  description?: string
  roomType?: RoomType
  startDate: string
  endDate: string
  multiplier?: number
  fixedAmount?: number
  propertyId: string
}

export interface CreatePricingRuleOutput {
  id: string
  name: string
  isActive: boolean
}

export class CreatePricingRuleUseCase {
  constructor(private ruleRepo: IPricingRuleRepository) {}

  async execute(input: CreatePricingRuleInput): Promise<Result<CreatePricingRuleOutput, string>> {
    const dateRangeResult = RoomDateRange.create(
      new Date(input.startDate),
      new Date(input.endDate)
    )
    if (dateRangeResult.isFail) return Result.fail(dateRangeResult.error)

    let fixedAmount: MonetaryValue | undefined
    if (input.fixedAmount !== undefined) {
      const amtResult = MonetaryValue.create(input.fixedAmount)
      if (amtResult.isFail) return Result.fail(amtResult.error)
      fixedAmount = amtResult.value
    }

    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const ruleResult = PricingRule.create({
      id,
      name: input.name,
      description: input.description,
      roomType: input.roomType,
      dateRange: dateRangeResult.value,
      multiplier: input.multiplier,
      fixedAmount,
      propertyId: input.propertyId,
    })
    if (ruleResult.isFail) return Result.fail(ruleResult.error)

    const rule = ruleResult.value
    const conflicting = await this.ruleRepo.findConflicting(rule)
    if (conflicting) {
      return Result.fail('Já existe uma regra de precificação ativa neste período')
    }

    await this.ruleRepo.save(rule)

    return Result.ok({
      id: rule.id,
      name: rule.name,
      isActive: rule.isActive,
    })
  }
}
