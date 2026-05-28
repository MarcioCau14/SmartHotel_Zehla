import { describe, it, expect } from 'vitest'
import { RoomMaintenance } from '../../../../src/domain/room/entities/RoomMaintenance'
import { RoomDateRange } from '../../../../src/domain/room/value-objects/RoomDateRange'
import { MaintenanceStatus } from '../../../../src/domain/room/enums'

function makeRange(start: string, end: string) {
  return RoomDateRange.create(new Date(start), new Date(end)).value
}

describe('RoomMaintenance', () => {
  it('should create scheduled maintenance', () => {
    const m = RoomMaintenance.create({
      id: 'maint-1',
      roomId: 'room-1',
      reason: 'Pintura das paredes',
      period: makeRange('2025-07-01', '2025-07-03'),
    })
    expect(m.isOk).toBe(true)
    expect(m.value.reason).toBe('Pintura das paredes')
    expect(m.value.status).toBe(MaintenanceStatus.SCHEDULED)
  })

  it('should accept optional description', () => {
    const m = RoomMaintenance.create({
      id: 'maint-2',
      roomId: 'room-1',
      reason: 'Troca de cama',
      description: 'Cama box king size',
      period: makeRange('2025-07-05', '2025-07-06'),
    })
    expect(m.isOk).toBe(true)
    expect(m.value.description).toBe('Cama box king size')
  })

  it('should fail without id', () => {
    const m = RoomMaintenance.create({
      id: '',
      roomId: 'room-1',
      reason: 'Manutenção',
      period: makeRange('2025-07-01', '2025-07-03'),
    })
    expect(m.isFail).toBe(true)
  })

  it('should fail with short reason', () => {
    const m = RoomMaintenance.create({
      id: 'maint-3',
      roomId: 'room-1',
      reason: 'OK',
      period: makeRange('2025-07-01', '2025-07-03'),
    })
    expect(m.isFail).toBe(true)
    expect(m.error).toContain('3 caracteres')
  })

  it('should start maintenance', () => {
    const m = RoomMaintenance.create({
      id: 'maint-4',
      roomId: 'room-1',
      reason: 'Reparo elétrico',
      period: makeRange('2025-07-01', '2025-07-03'),
    }).value
    const result = m.start()
    expect(result.isOk).toBe(true)
    expect(m.status).toBe(MaintenanceStatus.IN_PROGRESS)
  })

  it('should fail start if already completed', () => {
    const m = RoomMaintenance.create({
      id: 'maint-5',
      roomId: 'room-1',
      reason: 'Reparo elétrico',
      period: makeRange('2025-07-01', '2025-07-03'),
    }).value
    m.start()
    m.complete()
    const result = m.start()
    expect(result.isFail).toBe(true)
  })

  it('should complete maintenance', () => {
    const m = RoomMaintenance.create({
      id: 'maint-6',
      roomId: 'room-1',
      reason: 'Reparo hidráulico',
      period: makeRange('2025-07-01', '2025-07-03'),
    }).value
    m.start()
    const result = m.complete()
    expect(result.isOk).toBe(true)
    expect(m.status).toBe(MaintenanceStatus.COMPLETED)
    expect(m.completedAt).toBeInstanceOf(Date)
  })

  it('should fail complete if not started', () => {
    const m = RoomMaintenance.create({
      id: 'maint-7',
      roomId: 'room-1',
      reason: 'Reparo hidráulico',
      period: makeRange('2025-07-01', '2025-07-03'),
    }).value
    const result = m.complete()
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('andamento')
  })

  it('should cancel scheduled maintenance', () => {
    const m = RoomMaintenance.create({
      id: 'maint-8',
      roomId: 'room-1',
      reason: 'Pintura cancelada',
      period: makeRange('2025-07-01', '2025-07-03'),
    }).value
    const result = m.cancel()
    expect(result.isOk).toBe(true)
    expect(m.status).toBe(MaintenanceStatus.CANCELLED)
  })

  it('should fail cancel if already completed', () => {
    const m = RoomMaintenance.create({
      id: 'maint-9',
      roomId: 'room-1',
      reason: 'Pintura',
      period: makeRange('2025-07-01', '2025-07-03'),
    }).value
    m.start()
    m.complete()
    const result = m.cancel()
    expect(result.isFail).toBe(true)
  })

  it('should detect if active on date', () => {
    const m = RoomMaintenance.create({
      id: 'maint-10',
      roomId: 'room-1',
      reason: 'Manutenção programada',
      period: makeRange('2025-07-01', '2025-07-10'),
    }).value
    expect(m.isActiveOn(new Date('2025-07-05'))).toBe(true)
    expect(m.isActiveOn(new Date('2025-06-01'))).toBe(false)
    expect(m.isActiveOn(new Date('2025-07-10'))).toBe(false)
  })

  it('should not be active when cancelled', () => {
    const m = RoomMaintenance.create({
      id: 'maint-11',
      roomId: 'room-1',
      reason: 'Cancelada',
      period: makeRange('2025-07-01', '2025-07-10'),
    }).value
    m.cancel()
    expect(m.isActiveOn(new Date('2025-07-05'))).toBe(false)
  })

  it('should serialize to JSON', () => {
    const m = RoomMaintenance.create({
      id: 'maint-12',
      roomId: 'room-1',
      reason: 'Reforma',
      description: 'Reforma completa',
      period: makeRange('2025-08-01', '2025-08-05'),
    }).value
    const json = m.toJSON()
    expect(json.id).toBe('maint-12')
    expect(json.reason).toBe('Reforma')
    expect(json.status).toBe(MaintenanceStatus.SCHEDULED)
    expect(json.period.nights).toBe(4)
  })
})
