import { describe, it, expect, beforeEach } from 'vitest'
import { CreateRoomUseCase } from '../../../../src/application/room/use-cases/CreateRoomUseCase'
import { InMemoryRoomRepository } from '../../../../src/infrastructure/persistence/room/InMemoryRoomRepository'
import { RoomType, PricingType } from '../../../../src/domain/room/enums'

describe('CreateRoomUseCase', () => {
  let roomRepo: InMemoryRoomRepository
  let useCase: CreateRoomUseCase

  beforeEach(() => {
    roomRepo = new InMemoryRoomRepository()
    useCase = new CreateRoomUseCase(roomRepo)
  })

  it('should create a valid room', async () => {
    const result = await useCase.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.number).toBe('101')
    expect(result.value.status).toBe('AVAILABLE')
  })

  it('should fail with duplicate room number', async () => {
    await useCase.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('existe um quarto')
  })

  it('should allow same number in different properties', async () => {
    await useCase.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-2',
    })
    expect(result.isOk).toBe(true)
  })

  it('should fail with 0 base price', async () => {
    const result = await useCase.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 0,
      propertyId: 'prop-1',
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with 0 adults', async () => {
    const result = await useCase.execute({
      number: '101',
      maxAdults: 0,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('1 adulto')
  })

  it('should create with all optional fields', async () => {
    const result = await useCase.execute({
      number: '201',
      name: 'Suíte Master',
      type: RoomType.MASTER,
      maxAdults: 3,
      maxChildren: 2,
      basePrice: 500,
      pricingType: PricingType.PER_PERSON,
      amenities: ['TV', 'WiFi', 'Frigobar'],
      description: 'Suíte com vista para o mar',
      images: ['https://example.com/photo.jpg'],
      propertyId: 'prop-1',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.number).toBe('201')

    const saved = await roomRepo.findByNumber('prop-1', '201')
    expect(saved).not.toBeNull()
    expect(saved!.name).toBe('Suíte Master')
    expect(saved!.type).toBe(RoomType.MASTER)
    expect(saved!.basePrice.amount).toBe(500)
    expect(saved!.amenities.count()).toBe(3)
  })

  it('should persist room in repository', async () => {
    await useCase.execute({
      number: '102',
      maxAdults: 2,
      basePrice: 150,
      propertyId: 'prop-1',
    })
    const found = await roomRepo.findByNumber('prop-1', '102')
    expect(found).not.toBeNull()
    expect(found!.number).toBe('102')
    expect(found!.status).toBe('AVAILABLE')
  })
})
