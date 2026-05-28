import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateRoomStatusUseCase } from '../../../../src/application/room/use-cases/UpdateRoomStatusUseCase'
import { CreateRoomUseCase } from '../../../../src/application/room/use-cases/CreateRoomUseCase'
import { InMemoryRoomRepository } from '../../../../src/infrastructure/persistence/room/InMemoryRoomRepository'
import { InMemoryRoomStatusLogRepository } from '../../../../src/infrastructure/persistence/room/InMemoryRoomStatusLogRepository'
import { RoomStatus } from '../../../../src/domain/room/enums'

describe('UpdateRoomStatusUseCase', () => {
  let roomRepo: InMemoryRoomRepository
  let logRepo: InMemoryRoomStatusLogRepository
  let useCase: UpdateRoomStatusUseCase
  let createRoom: CreateRoomUseCase

  beforeEach(() => {
    roomRepo = new InMemoryRoomRepository()
    logRepo = new InMemoryRoomStatusLogRepository()
    useCase = new UpdateRoomStatusUseCase(roomRepo, logRepo)
    createRoom = new CreateRoomUseCase(roomRepo)
  })

  it('should change AVAILABLE to OCCUPIED', async () => {
    const created = await createRoom.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    const result = await useCase.execute({
      roomId: created.value.id,
      status: RoomStatus.OCCUPIED,
      changedBy: 'reception',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.newStatus).toBe(RoomStatus.OCCUPIED)
    expect(result.value.previousStatus).toBe(RoomStatus.AVAILABLE)
  })

  it('should reject OCCUPIED to AVAILABLE directly', async () => {
    const created = await createRoom.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    await useCase.execute({
      roomId: created.value.id,
      status: RoomStatus.OCCUPIED,
      changedBy: 'reception',
    })
    const result = await useCase.execute({
      roomId: created.value.id,
      status: RoomStatus.AVAILABLE,
      changedBy: 'reception',
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Não é possível')
  })

  it('should allow full cycle: OCCUPIED → CLEANING → AVAILABLE', async () => {
    const created = await createRoom.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    const roomId = created.value.id

    await useCase.execute({ roomId, status: RoomStatus.OCCUPIED, changedBy: 'reception' })
    const cleaning = await useCase.execute({ roomId, status: RoomStatus.CLEANING, changedBy: 'housekeeping' })
    expect(cleaning.isOk).toBe(true)
    expect(cleaning.value.newStatus).toBe(RoomStatus.CLEANING)

    const available = await useCase.execute({ roomId, status: RoomStatus.AVAILABLE, changedBy: 'housekeeping' })
    expect(available.isOk).toBe(true)
    expect(available.value.newStatus).toBe(RoomStatus.AVAILABLE)
  })

  it('should reject invalid status value', async () => {
    const result = await useCase.execute({
      roomId: 'invalid',
      status: 'INVALID_STATUS',
      changedBy: 'system',
    })
    expect(result.isFail).toBe(true)
  })

  it('should reject non-existent room', async () => {
    const result = await useCase.execute({
      roomId: 'non-existent',
      status: RoomStatus.OCCUPIED,
      changedBy: 'system',
    })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('não encontrado')
  })

  it('should persist status change log', async () => {
    const created = await createRoom.execute({
      number: '101',
      maxAdults: 2,
      basePrice: 200,
      propertyId: 'prop-1',
    })
    await useCase.execute({
      roomId: created.value.id,
      status: RoomStatus.OCCUPIED,
      reason: 'Check-in realizado',
      changedBy: 'reception-1',
    })

    const logs = await logRepo.findByRoomId(created.value.id)
    expect(logs).toHaveLength(1)
    expect(logs[0].reason).toBe('Check-in realizado')
    expect(logs[0].changedBy).toBe('reception-1')
    expect(logs[0].previousStatus).toBe(RoomStatus.AVAILABLE)
    expect(logs[0].newStatus).toBe(RoomStatus.OCCUPIED)
  })
})
