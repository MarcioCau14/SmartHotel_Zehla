import { describe, it, expect } from 'vitest'
import { RoomDateRange } from '../../../../src/domain/room/value-objects/RoomDateRange'

describe('RoomDateRange', () => {
  const jun1 = new Date('2025-06-01')
  const jun5 = new Date('2025-06-05')
  const jun3 = new Date('2025-06-03')
  const jun10 = new Date('2025-06-10')

  it('should create valid date range', () => {
    const r = RoomDateRange.create(jun1, jun5)
    expect(r.isOk).toBe(true)
    expect(r.value.nights).toBe(4)
  })

  it('should fail with same date', () => {
    const r = RoomDateRange.create(jun1, jun1)
    expect(r.isFail).toBe(true)
    expect(r.error).toContain('posterior')
  })

  it('should fail with end before start', () => {
    const r = RoomDateRange.create(jun5, jun1)
    expect(r.isFail).toBe(true)
  })

  it('should fail with invalid dates', () => {
    const r = RoomDateRange.create(new Date('invalid'), jun5)
    expect(r.isFail).toBe(true)
  })

  it('should strip time component (use UTC midnight)', () => {
    const start = new Date('2025-06-01T10:30:00')
    const end = new Date('2025-06-05T15:45:00')
    const r = RoomDateRange.create(start, end).value
    expect(r.startDate.getUTCHours()).toBe(0)
    expect(r.startDate.getUTCMinutes()).toBe(0)
    expect(r.endDate.getUTCHours()).toBe(0)
    expect(r.endDate.getUTCMinutes()).toBe(0)
  })

  it('should detect overlap', () => {
    const r1 = RoomDateRange.create(jun1, jun5).value
    const r2 = RoomDateRange.create(jun3, jun10).value
    const r3 = RoomDateRange.create(jun5, jun10).value

    expect(r1.overlaps(r2)).toBe(true)
    expect(r1.overlaps(r3)).toBe(false)
  })

  it('should check if contains date', () => {
    const r = RoomDateRange.create(jun1, jun5).value
    expect(r.contains(jun3)).toBe(true)
    expect(r.contains(new Date('2025-06-01'))).toBe(true)
    expect(r.contains(new Date('2025-06-05'))).toBe(false)
    expect(r.contains(new Date('2025-06-10'))).toBe(false)
  })

  it('should check if contains another range', () => {
    const outer = RoomDateRange.create(jun1, jun10).value
    const inner = RoomDateRange.create(jun3, jun5).value
    expect(outer.containsRange(inner)).toBe(true)
  })

  it('should serialize to JSON', () => {
    const r = RoomDateRange.create(jun1, jun5).value
    const json = r.toJSON()
    expect(json.nights).toBe(4)
    expect(typeof json.startDate).toBe('string')
    expect(typeof json.endDate).toBe('string')
    expect(json.startDate.length).toBeGreaterThan(0)
    expect(json.endDate.length).toBeGreaterThan(0)
  })
})
