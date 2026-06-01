import { describe, it, expect, beforeEach } from 'vitest'
import { CreatePricingRuleUseCase } from '../../../../src/application/room/use-cases/CreatePricingRuleUseCase'
import { InMemoryPricingRuleRepository } from '../../../../src/infrastructure/persistence/room/InMemoryPricingRuleRepository'
import { RoomType } from '../../../../src/domain/room/enums'

describe('CreatePricingRuleUseCase', () => {
  let ruleRepo: InMemoryPricingRuleRepository
  let useCase: CreatePricingRuleUseCase

  beforeEach(() => {
    ruleRepo = new InMemoryPricingRuleRepository()
    useCase = new CreatePricingRuleUseCase(ruleRepo)
  })

  it('should create a valid pricing rule', async () => {
    const result = await useCase.execute({
      name: 'Réveillon 2025',
      startDate: '2025-12-28',
      endDate: '2026-01-02',
      multiplier: 2.0,
      propertyId: 'prop-1',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.name).toBe('Réveillon 2025')
    expect(result.value.isActive).toBe(true)
  })

  it('should create a rule with fixed amount', async () => {
    const result = await useCase.execute({
      name: 'Fixo Réveillon',
      startDate: '2025-12-31',
      endDate: '2026-01-01',
      fixedAmount: 1500,
      propertyId: 'prop-1',
    })
    expect(result.isOk).toBe(true)
  })

  it('should create a rule for specific room type', async () => {
    const result = await useCase.execute({
      name: 'Suíte Premium',
      roomType: RoomType.SUITE,
      startDate: '2025-07-01',
      endDate: '2025-07-15',
      multiplier: 1.5,
      propertyId: 'prop-1',
    })
    expect(result.isOk).toBe(true)
  })

  it('should reject conflicting rule (same period, same property)', async () => {
    await useCase.execute({
      name: 'Alta Temporada',
      startDate: '2025-12-01',
      endDate: '2026-01-31',
      multiplier: 2.0,
      propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      name: 'Réveillon',
      startDate: '2025-12-28',
      endDate: '2026-01-02',
      multiplier: 2.5,
      propertyId: 'prop-1',
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('existe uma regra')
  })

  it('should allow same period in different properties', async () => {
    await useCase.execute({
      name: 'Alta Temporada',
      startDate: '2025-12-01',
      endDate: '2026-01-31',
      multiplier: 2.0,
      propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      name: 'Alta Temporada',
      startDate: '2025-12-01',
      endDate: '2026-01-31',
      multiplier: 2.0,
      propertyId: 'prop-2',
    })
    expect(result.isOk).toBe(true)
  })

  it('should reject multiplier < 0.5', async () => {
    const result = await useCase.execute({
      name: 'Desconto',
      startDate: '2025-07-01',
      endDate: '2025-07-05',
      multiplier: 0.3,
      propertyId: 'prop-1',
    })
    expect(result.isFail).toBe(true)
  })

  it('should reject invalid date range', async () => {
    const result = await useCase.execute({
      name: 'Invalida',
      startDate: '2025-07-10',
      endDate: '2025-07-05',
      multiplier: 1.0,
      propertyId: 'prop-1',
    })
    expect(result.isFail).toBe(true)
  })

  it('should reject empty name', async () => {
    const result = await useCase.execute({
      name: '  ',
      startDate: '2025-07-01',
      endDate: '2025-07-05',
      multiplier: 1.0,
      propertyId: 'prop-1',
    })
    expect(result.isFail).toBe(true)
  })
})
