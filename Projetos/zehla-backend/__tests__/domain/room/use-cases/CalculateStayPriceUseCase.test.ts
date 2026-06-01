import { describe, it, expect, beforeEach } from 'vitest'
import { CalculateStayPriceUseCase } from '../../../../src/application/room/use-cases/CalculateStayPriceUseCase'
import { CreateRoomUseCase } from '../../../../src/application/room/use-cases/CreateRoomUseCase'
import { CreatePricingRuleUseCase } from '../../../../src/application/room/use-cases/CreatePricingRuleUseCase'
import { InMemoryRoomRepository } from '../../../../src/infrastructure/persistence/room/InMemoryRoomRepository'
import { InMemoryPricingRuleRepository } from '../../../../src/infrastructure/persistence/room/InMemoryPricingRuleRepository'
import { InMemoryRevenueSettingsRepository } from '../../../../src/infrastructure/persistence/room/InMemoryRevenueSettingsRepository'
import { PricingCalculatorService } from '../../../../src/domain/room/services/PricingCalculatorService'
import { RevenueSettings } from '../../../../src/domain/room/value-objects/RevenueSettings'

describe('CalculateStayPriceUseCase', () => {
  let roomRepo: InMemoryRoomRepository
  let ruleRepo: InMemoryPricingRuleRepository
  let revenueRepo: InMemoryRevenueSettingsRepository
  let calculator: PricingCalculatorService
  let useCase: CalculateStayPriceUseCase
  let createRoom: CreateRoomUseCase
  let createRule: CreatePricingRuleUseCase

  beforeEach(() => {
    roomRepo = new InMemoryRoomRepository()
    ruleRepo = new InMemoryPricingRuleRepository()
    revenueRepo = new InMemoryRevenueSettingsRepository()
    calculator = new PricingCalculatorService()
    useCase = new CalculateStayPriceUseCase(roomRepo, ruleRepo, revenueRepo, calculator)
    createRoom = new CreateRoomUseCase(roomRepo)
    createRule = new CreatePricingRuleUseCase(ruleRepo)
  })

  it('should calculate base price without rules', async () => {
    const created = await createRoom.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      roomId: created.value.id,
      checkIn: '2025-07-01',
      checkOut: '2025-07-04',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.nightlyBreakdown).toHaveLength(3)
    expect(result.value.total).toBe(600)
  })

  it('should apply multiplier rule to specific dates', async () => {
    const created = await createRoom.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    await createRule.execute({
      name: 'Fim de Semana',
      startDate: '2025-07-05',
      endDate: '2025-07-07',
      multiplier: 1.5,
      propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      roomId: created.value.id,
      checkIn: '2025-07-03',
      checkOut: '2025-07-07',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.nightlyBreakdown).toHaveLength(4)
    expect(result.value.nightlyBreakdown[0].finalPrice).toBe(200) // Jul 3 - no rule
    expect(result.value.nightlyBreakdown[1].finalPrice).toBe(200) // Jul 4 - no rule
    expect(result.value.nightlyBreakdown[2].finalPrice).toBe(300) // Jul 5 - 1.5x
    expect(result.value.nightlyBreakdown[3].finalPrice).toBe(300) // Jul 6 - 1.5x
    expect(result.value.total).toBe(1000)
  })

  it('should apply weekend multiplier from revenue settings', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    const settings = RevenueSettings.create({
      dynamicPricingEnabled: true,
      weekendMultiplier: 2.0,
    }).value
    await revenueRepo.save('prop-1', settings)

    const result = await useCase.execute({
      roomId: created.value.id,
      checkIn: '2025-07-03', // Thursday
      checkOut: '2025-07-07', // Monday
    })
    expect(result.isOk).toBe(true)
    expect(result.value.nightlyBreakdown).toHaveLength(4)
    expect(result.value.nightlyBreakdown[0].finalPrice).toBe(200)  // Jul 3 Thu - base
    expect(result.value.nightlyBreakdown[1].finalPrice).toBe(400)  // Jul 4 Fri - 2x
    expect(result.value.nightlyBreakdown[2].finalPrice).toBe(400)  // Jul 5 Sat - 2x
    expect(result.value.nightlyBreakdown[3].finalPrice).toBe(200)  // Jul 6 Sun - base
  })

  it('should apply lead time discount', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    const settings = RevenueSettings.create({
      dynamicPricingEnabled: true,
      leadTimeDiscounts: [{ daysBefore: 30, discount: 0.10 }],
      weekendMultiplier: 1.0,
    }).value
    await revenueRepo.save('prop-1', settings)

    const result = await useCase.execute({
      roomId: created.value.id,
      checkIn: '2027-10-04', // Monday
      checkOut: '2027-10-07', // Thursday
    })
    expect(result.isOk).toBe(true)
    expect(result.value.nightlyBreakdown).toHaveLength(3)
    expect(result.value.nightlyBreakdown[0].finalPrice).toBe(180) // 200 - 10% = 180
  })

  it('should apply occupancy surge pricing', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    const settings = RevenueSettings.create({
      dynamicPricingEnabled: true,
      occupancyThresholds: [{ minOccupancy: 0.8, multiplier: 1.5 }],
    }).value
    await revenueRepo.save('prop-1', settings)

    const result = await useCase.execute({
      roomId: created.value.id,
      checkIn: '2025-07-01',
      checkOut: '2025-07-03',
      occupancyRate: 0.9,
    })
    expect(result.isOk).toBe(true)
    expect(result.value.nightlyBreakdown[0].finalPrice).toBe(300) // 200 * 1.5
  })

  it('should clamp price to maxPrice', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    const settings = RevenueSettings.create({
      dynamicPricingEnabled: true,
      maxPrice: 250,
      weekendMultiplier: 2.0,
    }).value
    await revenueRepo.save('prop-1', settings)

    const result = await useCase.execute({
      roomId: created.value.id,
      checkIn: '2025-07-06', // Sunday
      checkOut: '2025-07-09', // Wednesday
    })
    expect(result.isOk).toBe(true)
    expect(result.value.nightlyBreakdown).toHaveLength(3)
    expect(result.value.nightlyBreakdown[0].finalPrice).toBe(200) // Sun - base (no weekend)
    expect(result.value.nightlyBreakdown[1].finalPrice).toBe(200) // Mon - base
    expect(result.value.nightlyBreakdown[2].finalPrice).toBe(200) // Tue - base
  })

  it('should fail with invalid dates', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      roomId: created.value.id,
      checkIn: 'invalid',
      checkOut: '2025-07-04',
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with checkOut before checkIn', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      roomId: created.value.id,
      checkIn: '2025-07-04',
      checkOut: '2025-07-01',
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with non-existent room', async () => {
    const result = await useCase.execute({
      roomId: 'non-existent',
      checkIn: '2025-07-01',
      checkOut: '2025-07-04',
    })
    expect(result.isFail).toBe(true)
  })

  it('should calculate with fixedAmount rule', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    await createRule.execute({
      name: 'Réveillon',
      startDate: '2025-12-31',
      endDate: '2026-01-02',
      fixedAmount: 1500,
      propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      roomId: created.value.id,
      checkIn: '2025-12-30',
      checkOut: '2026-01-02',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.nightlyBreakdown).toHaveLength(3)
    expect(result.value.nightlyBreakdown[0].finalPrice).toBe(200)  // Dec 30 - no rule
    expect(result.value.nightlyBreakdown[1].finalPrice).toBe(1500) // Dec 31 - fixed
    expect(result.value.nightlyBreakdown[2].finalPrice).toBe(1500) // Jan 1 - fixed
  })

  it('should report applied rules in breakdown', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    const settings = RevenueSettings.create({
      dynamicPricingEnabled: true,
      weekendMultiplier: 2.0,
    }).value
    await revenueRepo.save('prop-1', settings)

    const result = await useCase.execute({
      roomId: created.value.id,
      checkIn: '2025-07-04', // Friday
      checkOut: '2025-07-06', // Sunday
    })
    expect(result.isOk).toBe(true)
    expect(result.value.nightlyBreakdown[0].appliedRules).toContain('weekend')
    expect(result.value.nightlyBreakdown[1].appliedRules).toContain('weekend')
  })
})
