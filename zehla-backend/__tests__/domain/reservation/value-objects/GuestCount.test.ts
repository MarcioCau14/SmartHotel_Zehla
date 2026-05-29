import { describe, it, expect } from 'vitest'
import { GuestCount } from '../../../../src/domain/reservation/value-objects/GuestCount'

describe('GuestCount', () => {
  it('should create valid guest count', () => {
    const gc = GuestCount.create(2)
    expect(gc.isOk).toBe(true)
    expect(gc.value.value).toBe(2)
  })

  it('should fail with zero', () => {
    const gc = GuestCount.create(0)
    expect(gc.isFail).toBe(true)
  })

  it('should fail with negative', () => {
    const gc = GuestCount.create(-1)
    expect(gc.isFail).toBe(true)
  })

  it('should fail with non-integer', () => {
    const gc = GuestCount.create(2.5)
    expect(gc.isFail).toBe(true)
  })

  it('should fail with excessive count', () => {
    const gc = GuestCount.create(100)
    expect(gc.isFail).toBe(true)
  })

  it('should detect exceeding capacity', () => {
    const gc = GuestCount.create(4).value
    expect(gc.exceedsCapacity(2)).toBe(true)
    expect(gc.exceedsCapacity(4)).toBe(false)
    expect(gc.exceedsCapacity(6)).toBe(false)
  })
})
