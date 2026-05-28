import { describe, it, expect } from 'vitest'
import { RoomStatusLog } from '../../../../src/domain/room/entities/RoomStatusLog'
import { RoomStatus } from '../../../../src/domain/room/enums'

describe('RoomStatusLog', () => {
  it('should create valid status log', () => {
    const log = RoomStatusLog.create({
      id: 'log-1',
      roomId: 'room-1',
      previousStatus: RoomStatus.AVAILABLE,
      newStatus: RoomStatus.OCCUPIED,
      changedBy: 'system',
    })
    expect(log.isOk).toBe(true)
    expect(log.value.previousStatus).toBe(RoomStatus.AVAILABLE)
    expect(log.value.newStatus).toBe(RoomStatus.OCCUPIED)
    expect(log.value.changedBy).toBe('system')
  })

  it('should accept optional reason', () => {
    const log = RoomStatusLog.create({
      id: 'log-2',
      roomId: 'room-1',
      previousStatus: RoomStatus.AVAILABLE,
      newStatus: RoomStatus.MAINTENANCE,
      reason: 'Vazamento no banheiro',
      changedBy: 'reception',
    })
    expect(log.isOk).toBe(true)
    expect(log.value.reason).toBe('Vazamento no banheiro')
  })

  it('should fail without id', () => {
    const log = RoomStatusLog.create({
      id: '',
      roomId: 'room-1',
      previousStatus: RoomStatus.AVAILABLE,
      newStatus: RoomStatus.OCCUPIED,
      changedBy: 'system',
    })
    expect(log.isFail).toBe(true)
  })

  it('should fail without changedBy', () => {
    const log = RoomStatusLog.create({
      id: 'log-3',
      roomId: 'room-1',
      previousStatus: RoomStatus.AVAILABLE,
      newStatus: RoomStatus.OCCUPIED,
      changedBy: '',
    })
    expect(log.isFail).toBe(true)
  })

  it('should fail with same status', () => {
    const log = RoomStatusLog.create({
      id: 'log-4',
      roomId: 'room-1',
      previousStatus: RoomStatus.AVAILABLE,
      newStatus: RoomStatus.AVAILABLE,
      changedBy: 'system',
    })
    expect(log.isFail).toBe(true)
    expect(log.error).toContain('diferentes')
  })

  it('should generate createdAt', () => {
    const log = RoomStatusLog.create({
      id: 'log-5',
      roomId: 'room-1',
      previousStatus: RoomStatus.AVAILABLE,
      newStatus: RoomStatus.OCCUPIED,
      changedBy: 'system',
    }).value
    expect(log.createdAt).toBeInstanceOf(Date)
  })

  it('should serialize to JSON', () => {
    const log = RoomStatusLog.create({
      id: 'log-6',
      roomId: 'room-1',
      previousStatus: RoomStatus.AVAILABLE,
      newStatus: RoomStatus.OCCUPIED,
      reason: 'Check-in',
      changedBy: 'reception',
    }).value
    const json = log.toJSON()
    expect(json.id).toBe('log-6')
    expect(json.previousStatus).toBe(RoomStatus.AVAILABLE)
    expect(json.newStatus).toBe(RoomStatus.OCCUPIED)
    expect(json.reason).toBe('Check-in')
  })
})
