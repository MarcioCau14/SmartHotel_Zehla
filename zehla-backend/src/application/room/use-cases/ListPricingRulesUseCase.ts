import { Result } from '../../../domain/shared/Result'
import { IPricingRuleRepository } from '../ports/IPricingRuleRepository'

export interface ListPricingRulesInput {
  propertyId: string
}

export interface PricingRuleOutput {
  id: string
  name: string
  description: string | undefined
  roomType: string | null
  dateRange: { startDate: string; endDate: string; nights: number }
  multiplier: number
  fixedAmount: { amount: number; currency: string } | null
  isActive: boolean
  overridePriority: number
  propertyId: string
  createdAt: string
}

export class ListPricingRulesUseCase {
  constructor(private ruleRepo: IPricingRuleRepository) {}

  async execute(input: ListPricingRulesInput): Promise<Result<PricingRuleOutput[], string>> {
    if (!input.propertyId) return Result.fail('propertyId é obrigatório')

    const rules = await this.ruleRepo.findByProperty(input.propertyId)

    return Result.ok(
      rules.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        roomType: r.roomType,
        dateRange: r.dateRange.toJSON(),
        multiplier: r.multiplier,
        fixedAmount: r.fixedAmount?.toJSON() ?? null,
        isActive: r.isActive,
        overridePriority: r.overridePriority,
        propertyId: r.propertyId,
        createdAt: r.createdAt.toISOString(),
      }))
    )
  }
}
