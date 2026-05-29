import { describe, it, expect, beforeEach } from 'vitest'
import { ListPricingRulesUseCase } from '../../../../src/application/room/use-cases/ListPricingRulesUseCase'
import { CreatePricingRuleUseCase } from '../../../../src/application/room/use-cases/CreatePricingRuleUseCase'
import { InMemoryPricingRuleRepository } from '../../../../src/infrastructure/persistence/room/InMemoryPricingRuleRepository'
import { RoomType } from '../../../../src/domain/room/enums'

describe('ListPricingRulesUseCase', () => {
  let ruleRepo: InMemoryPricingRuleRepository
  let useCase: ListPricingRulesUseCase
  let createRule: CreatePricingRuleUseCase

  beforeEach(() => {
    ruleRepo = new InMemoryPricingRuleRepository()
    useCase = new ListPricingRulesUseCase(ruleRepo)
    createRule = new CreatePricingRuleUseCase(ruleRepo)
  })

  it('should list all rules for property', async () => {
    await createRule.execute({
      name: 'Alta Temporada',
      startDate: '2025-07-01', endDate: '2025-08-31',
      multiplier: 1.5, propertyId: 'prop-1',
    })
    await createRule.execute({
      name: 'Réveillon',
      startDate: '2025-12-28', endDate: '2026-01-02',
      multiplier: 2.0, propertyId: 'prop-1',
    })

    const result = await useCase.execute({ propertyId: 'prop-1' })
    expect(result.isOk).toBe(true)
    expect(result.value).toHaveLength(2)
    expect(result.value[0].name).toBeTruthy()
  })

  it('should return empty for property with no rules', async () => {
    const result = await useCase.execute({ propertyId: 'empty-prop' })
    expect(result.isOk).toBe(true)
    expect(result.value).toHaveLength(0)
  })

  it('should require propertyId', async () => {
    const result = await useCase.execute({ propertyId: '' })
    expect(result.isFail).toBe(true)
  })

  it('should not return rules from other properties', async () => {
    await createRule.execute({
      name: 'Prop 1 Rule', startDate: '2025-07-01', endDate: '2025-07-05',
      multiplier: 1.5, propertyId: 'prop-1',
    })
    await createRule.execute({
      name: 'Prop 2 Rule', startDate: '2025-07-01', endDate: '2025-07-05',
      multiplier: 2.0, propertyId: 'prop-2',
    })

    const result = await useCase.execute({ propertyId: 'prop-1' })
    expect(result.value).toHaveLength(1)
    expect(result.value[0].name).toBe('Prop 1 Rule')
  })
})
