import { describe, it, expect, beforeEach } from 'vitest'
import { RoomControllerFactory } from '../../../infrastructure/http/room/RoomControllerFactory'
import { InMemoryRoomRepository } from '../../../infrastructure/persistence/room/InMemoryRoomRepository'
import { InMemoryPricingRuleRepository } from '../../../infrastructure/persistence/room/InMemoryPricingRuleRepository'
import { InMemoryRevenueSettingsRepository } from '../../../infrastructure/persistence/room/InMemoryRevenueSettingsRepository'
import { InMemoryRoomStatusLogRepository } from '../../../infrastructure/persistence/room/InMemoryRoomStatusLogRepository'
import { InMemoryRoomMaintenanceRepository } from '../../../infrastructure/persistence/room/InMemoryRoomMaintenanceRepository'
import { Room } from '../../../domain/room/entities/Room'
import { PricingRule } from '../../../domain/room/entities/PricingRule'
import { MonetaryValue } from '../../../domain/room/value-objects/MonetaryValue'
import { Capacity } from '../../../domain/room/value-objects/Capacity'
import { RoomDateRange } from '../../../domain/room/value-objects/RoomDateRange'
import { RoomType, RoomStatus } from '../../../domain/room/enums'
import { buildGet, buildPost, parseResponse } from '../../helpers/http-test'
import { GET as availabilityGET } from '../../../app/api/rooms/availability/route'
import { GET as pricingGET, POST as pricingPOST } from '../../../app/api/pricing-rules/route'

describe('GET /api/rooms/availability', () => {
  const roomRepo = new InMemoryRoomRepository()
  const maintenanceRepo = new InMemoryRoomMaintenanceRepository()

  beforeEach(() => {
    roomRepo.clear()
    RoomControllerFactory.configure({ roomRepo, maintenanceRepo })
  })

  it('deve retornar 400 quando propertyId não for informado', async () => {
    const req = buildGet('/api/rooms/availability')
    const res = await availabilityGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('propertyId')
  })

  it('deve retornar 200 com quartos disponíveis e stats', async () => {
    const room = Room.create({
      id: 'room-1', number: '101', propertyId: 'prop-1',
      basePrice: MonetaryValue.create(200).value,
      capacity: Capacity.create(2).value,
    }).value
    await roomRepo.save(room)

    const req = buildGet('/api/rooms/availability?propertyId=prop-1')
    const res = await availabilityGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(1)
    expect(body.stats).toBeDefined()
    expect(body.stats.available).toBe(1)
  })

  it('deve filtrar por data quando checkIn/checkOut forem informados', async () => {
    const room = Room.create({
      id: 'room-1', number: '101', propertyId: 'prop-1',
      basePrice: MonetaryValue.create(200).value,
      capacity: Capacity.create(2).value,
    }).value
    await roomRepo.save(room)

    const req = buildGet('/api/rooms/availability?propertyId=prop-1&checkIn=2026-06-01&checkOut=2026-06-03')
    const res = await availabilityGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.data).toHaveLength(1)
  })
})

describe('GET /api/pricing-rules', () => {
  const ruleRepo = new InMemoryPricingRuleRepository()

  beforeEach(() => {
    ruleRepo.clear()
    RoomControllerFactory.configure({ ruleRepo })
  })

  it('deve retornar 400 quando propertyId não for informado', async () => {
    const req = buildGet('/api/pricing-rules')
    const res = await pricingGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('propertyId')
  })

  it('deve retornar 200 com lista vazia quando não há regras', async () => {
    const req = buildGet('/api/pricing-rules?propertyId=prop-1')
    const res = await pricingGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toEqual([])
  })

  it('deve retornar 200 com regras cadastradas', async () => {
    const range = RoomDateRange.create(new Date('2026-06-01'), new Date('2026-06-30')).value
    const rule = PricingRule.create({
      id: 'rule-1', name: 'Alta temporada', propertyId: 'prop-1',
      multiplier: 1.5, dateRange: range,
    }).value
    await ruleRepo.save(rule)

    const req = buildGet('/api/pricing-rules?propertyId=prop-1')
    const res = await pricingGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].name).toBe('Alta temporada')
    expect(body.data[0].multiplier).toBe(1.5)
  })
})

describe('POST /api/pricing-rules', () => {
  const ruleRepo = new InMemoryPricingRuleRepository()

  beforeEach(() => {
    ruleRepo.clear()
    RoomControllerFactory.configure({ ruleRepo })
  })

  it('deve retornar 400 quando campos obrigatórios faltarem', async () => {
    const req = buildPost('/api/pricing-rules', { name: 'Teste' })
    const res = await pricingPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('deve retornar 201 quando regra for criada', async () => {
    const req = buildPost('/api/pricing-rules', {
      name: 'Alta temporada',
      propertyId: 'prop-1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      multiplier: 1.5,
    })
    const res = await pricingPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.name).toBe('Alta temporada')
    expect(body.data.isActive).toBe(true)
    expect(body.data.id).toBeDefined()
  })
})
