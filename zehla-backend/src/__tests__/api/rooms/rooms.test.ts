import { describe, it, expect, beforeEach } from 'vitest'
import { RoomControllerFactory } from '../../../infrastructure/http/room/RoomControllerFactory'
import { InMemoryRoomRepository } from '../../../infrastructure/persistence/room/InMemoryRoomRepository'
import { InMemoryPricingRuleRepository } from '../../../infrastructure/persistence/room/InMemoryPricingRuleRepository'
import { InMemoryRevenueSettingsRepository } from '../../../infrastructure/persistence/room/InMemoryRevenueSettingsRepository'
import { InMemoryRoomStatusLogRepository } from '../../../infrastructure/persistence/room/InMemoryRoomStatusLogRepository'
import { InMemoryRoomMaintenanceRepository } from '../../../infrastructure/persistence/room/InMemoryRoomMaintenanceRepository'
import { Room } from '../../../domain/room/entities/Room'
import { MonetaryValue } from '../../../domain/room/value-objects/MonetaryValue'
import { Capacity } from '../../../domain/room/value-objects/Capacity'
import { RoomType, RoomStatus } from '../../../domain/room/enums'
import { buildGet, buildPost, parseResponse } from '../../helpers/http-test'
import { GET, POST } from '../../../app/api/rooms/route'

describe('GET /api/rooms', () => {
  const roomRepo = new InMemoryRoomRepository()
  const ruleRepo = new InMemoryPricingRuleRepository()
  const revenueRepo = new InMemoryRevenueSettingsRepository()

  beforeEach(() => {
    roomRepo.clear()
    RoomControllerFactory.configure({ roomRepo, ruleRepo, revenueRepo })
  })

  it('deve retornar 400 quando propertyId não for informado', async () => {
    const req = buildGet('/api/rooms')
    const res = await GET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('propertyId')
  })

  it('deve retornar 200 com lista vazia quando não há quartos', async () => {
    const req = buildGet('/api/rooms?propertyId=prop-1')
    const res = await GET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toEqual([])
    expect(body.stats).toBeDefined()
    expect(body.stats.total).toBe(0)
  })

  it('deve retornar 200 com quartos e stats', async () => {
    const room1 = Room.create({
      id: 'room-1', number: '101', propertyId: 'prop-1',
      basePrice: MonetaryValue.create(200).value,
      capacity: Capacity.create(2).value,
    }).value
    const room2 = Room.create({
      id: 'room-2', number: '102', propertyId: 'prop-1',
      basePrice: MonetaryValue.create(350).value,
      capacity: Capacity.create(2).value,
    }).value
    await roomRepo.save(room1)
    await roomRepo.save(room2)

    const req = buildGet('/api/rooms?propertyId=prop-1')
    const res = await GET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2)
    expect(body.stats.total).toBe(2)
    expect(body.stats.available).toBe(2)
  })

  it('deve retornar 200 com filtro de status', async () => {
    const room1 = Room.create({
      id: 'room-1', number: '101', propertyId: 'prop-1',
      basePrice: MonetaryValue.create(200).value,
      capacity: Capacity.create(2).value,
    }).value
    room1.changeStatus(RoomStatus.OCCUPIED)
    await roomRepo.save(room1)
    const room2 = Room.create({
      id: 'room-2', number: '102', propertyId: 'prop-1',
      basePrice: MonetaryValue.create(350).value,
      capacity: Capacity.create(2).value,
    }).value
    await roomRepo.save(room2)

    const req = buildGet('/api/rooms?propertyId=prop-1&status=AVAILABLE')
    const res = await GET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.data).toHaveLength(1)
  })
})

describe('POST /api/rooms', () => {
  const roomRepo = new InMemoryRoomRepository()
  const ruleRepo = new InMemoryPricingRuleRepository()
  const revenueRepo = new InMemoryRevenueSettingsRepository()

  beforeEach(() => {
    roomRepo.clear()
    RoomControllerFactory.configure({ roomRepo, ruleRepo, revenueRepo })
  })

  it('deve retornar 400 quando payload obrigatório faltar', async () => {
    const req = buildPost('/api/rooms', {})
    const res = await POST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('deve retornar 400 com apenas number e sem propertyId', async () => {
    const req = buildPost('/api/rooms', { number: '103' })
    const res = await POST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('deve retornar 201 quando quarto for criado com sucesso', async () => {
    const req = buildPost('/api/rooms', {
      number: '201',
      propertyId: 'prop-1',
      basePrice: 450,
      type: 'SUITE',
    })
    const res = await POST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.number).toBe('201')
    expect(body.data.status).toBe('AVAILABLE')
    expect(body.data.id).toBeDefined()
  })

  it('deve retornar 409 quando número de quarto já existir', async () => {
    const req1 = buildPost('/api/rooms', { number: '301', propertyId: 'prop-1', basePrice: 300 })
    await POST(req1)

    const req2 = buildPost('/api/rooms', { number: '301', propertyId: 'prop-1', basePrice: 300 })
    const res = await POST(req2)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(409)
    expect(body.success).toBe(false)
  })
})
