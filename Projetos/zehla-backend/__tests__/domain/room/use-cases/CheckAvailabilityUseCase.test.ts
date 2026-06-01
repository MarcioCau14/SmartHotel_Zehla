import { describe, it, expect, beforeEach } from 'vitest'
import { CheckAvailabilityUseCase } from '../../../../src/application/room/use-cases/CheckAvailabilityUseCase'
import { CreateRoomUseCase } from '../../../../src/application/room/use-cases/CreateRoomUseCase'
import { UpdateRoomStatusUseCase } from '../../../../src/application/room/use-cases/UpdateRoomStatusUseCase'
import { InMemoryRoomRepository } from '../../../../src/infrastructure/persistence/room/InMemoryRoomRepository'
import { InMemoryRoomStatusLogRepository } from '../../../../src/infrastructure/persistence/room/InMemoryRoomStatusLogRepository'
import { InMemoryRoomMaintenanceRepository } from '../../../../src/infrastructure/persistence/room/InMemoryRoomMaintenanceRepository'
import { AvailabilityService } from '../../../../src/domain/room/services/AvailabilityService'
import { RoomStatus } from '../../../../src/domain/room/enums'

describe('CheckAvailabilityUseCase', () => {
  let roomRepo: InMemoryRoomRepository
  let maintenanceRepo: InMemoryRoomMaintenanceRepository
  let availabilityService: AvailabilityService
  let useCase: CheckAvailabilityUseCase
  let createRoom: CreateRoomUseCase
  let updateStatus: UpdateRoomStatusUseCase

  beforeEach(() => {
    roomRepo = new InMemoryRoomRepository()
    maintenanceRepo = new InMemoryRoomMaintenanceRepository()
    availabilityService = new AvailabilityService()
    useCase = new CheckAvailabilityUseCase(roomRepo, maintenanceRepo, availabilityService)
    createRoom = new CreateRoomUseCase(roomRepo)
    updateStatus = new UpdateRoomStatusUseCase(roomRepo, new InMemoryRoomStatusLogRepository())
  })

  it('should return stats with all rooms', async () => {
    await createRoom.execute({ number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })
    await createRoom.execute({ number: '102', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })
    await createRoom.execute({ number: '103', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })

    const result = await useCase.execute({ propertyId: 'prop-1' })
    expect(result.isOk).toBe(true)
    expect(result.value.rooms).toHaveLength(3)
    expect(result.value.stats.total).toBe(3)
    expect(result.value.stats.available).toBe(3)
    expect(result.value.stats.occupancyRate).toBe(0)
  })

  it('should reflect occupied rooms in stats', async () => {
    const r1 = await createRoom.execute({ number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })
    await createRoom.execute({ number: '102', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })

    await updateStatus.execute({
      roomId: r1.value.id,
      status: RoomStatus.OCCUPIED,
      changedBy: 'reception',
    })

    const result = await useCase.execute({ propertyId: 'prop-1' })
    expect(result.value.stats.occupied).toBe(1)
    expect(result.value.stats.available).toBe(1)
    expect(result.value.stats.occupancyRate).toBe(50)
  })

  it('should require propertyId', async () => {
    const result = await useCase.execute({ propertyId: '' })
    expect(result.isFail).toBe(true)
  })

  it('should filter rooms by availability with date range', async () => {
    await createRoom.execute({ number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })
    await createRoom.execute({ number: '102', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })

    const result = await useCase.execute({
      propertyId: 'prop-1',
      checkIn: '2025-07-01',
      checkOut: '2025-07-05',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.rooms).toHaveLength(2)
  })

  it('should return only property rooms', async () => {
    await createRoom.execute({ number: '101', maxAdults: 2, basePrice: 200, propertyId: 'prop-1' })
    await createRoom.execute({ number: '201', maxAdults: 2, basePrice: 300, propertyId: 'prop-2' })

    const result = await useCase.execute({ propertyId: 'prop-1' })
    expect(result.value.rooms).toHaveLength(1)
    expect(result.value.rooms[0].number).toBe('101')
  })
})
