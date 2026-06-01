import { describe, it, expect, beforeEach } from 'vitest'
import { ListRoomsUseCase } from '../../../../src/application/room/use-cases/ListRoomsUseCase'
import { CreateRoomUseCase } from '../../../../src/application/room/use-cases/CreateRoomUseCase'
import { InMemoryRoomRepository } from '../../../../src/infrastructure/persistence/room/InMemoryRoomRepository'
import { RoomType } from '../../../../src/domain/room/enums'

describe('ListRoomsUseCase', () => {
  let roomRepo: InMemoryRoomRepository
  let useCase: ListRoomsUseCase
  let createRoom: CreateRoomUseCase

  beforeEach(() => {
    roomRepo = new InMemoryRoomRepository()
    useCase = new ListRoomsUseCase(roomRepo)
    createRoom = new CreateRoomUseCase(roomRepo)
  })

  it('should list all rooms for property', async () => {
    await createRoom.execute({ number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })
    await createRoom.execute({ number: '102', maxAdults: 2, basePrice: 250, propertyId: 'prop-1' })

    const result = await useCase.execute({ propertyId: 'prop-1' })
    expect(result.isOk).toBe(true)
    expect(result.value.rooms).toHaveLength(2)
  })

  it('should include stats when requested', async () => {
    await createRoom.execute({ number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })
    await createRoom.execute({ number: '102', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })

    const result = await useCase.execute({ propertyId: 'prop-1', includeStats: true })
    expect(result.value.stats).toBeDefined()
    expect(result.value.stats!.total).toBe(2)
    expect(result.value.stats!.available).toBe(2)
  })

  it('should filter by type', async () => {
    await createRoom.execute({ number: '101', type: RoomType.STANDARD, maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })
    await createRoom.execute({ number: '201', type: RoomType.SUITE, maxAdults: 2, basePrice: 400, propertyId: 'prop-1' })

    const result = await useCase.execute({ propertyId: 'prop-1', type: 'SUITE' })
    expect(result.value.rooms).toHaveLength(1)
    expect(result.value.rooms[0].number).toBe('201')
  })

  it('should filter by search', async () => {
    await createRoom.execute({ number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })
    await createRoom.execute({ number: '102', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })

    const result = await useCase.execute({ propertyId: 'prop-1', search: '101' })
    expect(result.value.rooms).toHaveLength(1)
  })

  it('should return empty for non-existent property', async () => {
    const result = await useCase.execute({ propertyId: 'non-existent' })
    expect(result.isOk).toBe(true)
    expect(result.value.rooms).toHaveLength(0)
  })

  it('should require propertyId', async () => {
    const result = await useCase.execute({ propertyId: '' })
    expect(result.isFail).toBe(true)
  })

  it('should filter by min capacity', async () => {
    await createRoom.execute({ number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })
    await createRoom.execute({ number: '201', maxAdults: 4, basePrice: 350, propertyId: 'prop-1' })

    const result = await useCase.execute({ propertyId: 'prop-1', minCapacity: 3 })
    expect(result.value.rooms).toHaveLength(1)
    expect(result.value.rooms[0].number).toBe('201')
  })
})
