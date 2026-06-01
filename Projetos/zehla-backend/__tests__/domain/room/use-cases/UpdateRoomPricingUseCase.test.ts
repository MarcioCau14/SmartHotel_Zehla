import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateRoomPricingUseCase } from '../../../../src/application/room/use-cases/UpdateRoomPricingUseCase'
import { CreateRoomUseCase } from '../../../../src/application/room/use-cases/CreateRoomUseCase'
import { InMemoryRoomRepository } from '../../../../src/infrastructure/persistence/room/InMemoryRoomRepository'
import { PricingType } from '../../../../src/domain/room/enums'

describe('UpdateRoomPricingUseCase', () => {
  let roomRepo: InMemoryRoomRepository
  let useCase: UpdateRoomPricingUseCase
  let createRoom: CreateRoomUseCase

  beforeEach(() => {
    roomRepo = new InMemoryRoomRepository()
    useCase = new UpdateRoomPricingUseCase(roomRepo)
    createRoom = new CreateRoomUseCase(roomRepo)
  })

  it('should update base price and pricing type', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      roomId: created.value.id,
      basePrice: 350,
      pricingType: PricingType.PER_PERSON,
    })
    expect(result.isOk).toBe(true)
    expect(result.value.basePrice).toBe(350)
    expect(result.value.pricingType).toBe(PricingType.PER_PERSON)
  })

  it('should persist pricing update in repository', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    await useCase.execute({
      roomId: created.value.id,
      basePrice: 450,
      pricingType: PricingType.PER_ROOM,
    })
    const saved = await roomRepo.findById(created.value.id)
    expect(saved!.basePrice.amount).toBe(450)
    expect(saved!.pricingType).toBe(PricingType.PER_ROOM)
  })

  it('should fail with non-existent room', async () => {
    const result = await useCase.execute({
      roomId: 'non-existent',
      basePrice: 300,
      pricingType: PricingType.PER_ROOM,
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrado')
  })

  it('should fail with zero base price', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      roomId: created.value.id,
      basePrice: 0,
      pricingType: PricingType.PER_ROOM,
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with negative base price', async () => {
    const created = await createRoom.execute({
      number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      roomId: created.value.id,
      basePrice: -50,
      pricingType: PricingType.PER_ROOM,
    })
    expect(result.isFail).toBe(true)
  })
})
