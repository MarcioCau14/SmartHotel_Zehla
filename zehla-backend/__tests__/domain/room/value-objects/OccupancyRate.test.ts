import { describe, it, expect } from 'vitest'
import { OccupancyRate } from '../../../../src/domain/room/value-objects/OccupancyRate'

describe('OccupancyRate', () => {
  it('should create valid occupancy rate', () => {
    const o = OccupancyRate.create(10, 7)
    expect(o.isOk).toBe(true)
    expect(o.value.rate).toBe(0.7)
    expect(o.value.percentage).toBe(70)
  })

  it('should create with zero occupancy', () => {
    const o = OccupancyRate.create(10, 0)
    expect(o.isOk).toBe(true)
    expect(o.value.rate).toBe(0)
    expect(o.value.percentage).toBe(0)
  })

  it('should fail with zero rooms', () => {
    const o = OccupancyRate.create(0, 0)
    expect(o.isFail).toBe(true)
  })

  it('should fail with negative occupied', () => {
    const o = OccupancyRate.create(10, -1)
    expect(o.isFail).toBe(true)
  })

  it('should fail with occupied exceeding total', () => {
    const o = OccupancyRate.create(10, 15)
    expect(o.isFail).toBe(true)
  })

  it('should detect high occupancy (>= 80%)', () => {
    expect(OccupancyRate.create(10, 8).value.isHighOccupancy()).toBe(true)
    expect(OccupancyRate.create(10, 7).value.isHighOccupancy()).toBe(false)
  })

  it('should detect low occupancy (<= 30%)', () => {
    expect(OccupancyRate.create(10, 3).value.isLowOccupancy()).toBe(true)
    expect(OccupancyRate.create(10, 4).value.isLowOccupancy()).toBe(false)
  })

  it('should serialize to JSON', () => {
    const o = OccupancyRate.create(20, 15).value
    expect(o.toJSON()).toEqual({
      rate: 0.75,
      percentage: 75,
      totalRooms: 20,
      occupiedRooms: 15,
    })
  })
})
