import { describe, it, expect } from 'vitest'
import { Capacity } from '../../../../src/domain/room/value-objects/Capacity'

describe('Capacity', () => {
  it('should create valid capacity', () => {
    const c = Capacity.create(2)
    expect(c.isOk).toBe(true)
    expect(c.value.maxAdults).toBe(2)
    expect(c.value.maxChildren).toBe(0)
    expect(c.value.maxTotal).toBe(2)
  })

  it('should accept children', () => {
    const c = Capacity.create(2, 2)
    expect(c.isOk).toBe(true)
    expect(c.value.maxChildren).toBe(2)
    expect(c.value.maxTotal).toBe(4)
  })

  it('should fail with 0 adults', () => {
    const c = Capacity.create(0)
    expect(c.isFail).toBe(true)
    expect(c.error).toContain('mínima')
  })

  it('should fail with negative adults', () => {
    const c = Capacity.create(-1)
    expect(c.isFail).toBe(true)
  })

  it('should fail with negative children', () => {
    const c = Capacity.create(2, -1)
    expect(c.isFail).toBe(true)
  })

  it('should fail with non-integer', () => {
    const c = Capacity.create(2.5)
    expect(c.isFail).toBe(true)
  })

  it('should fail with excessive adults', () => {
    const c = Capacity.create(25)
    expect(c.isFail).toBe(true)
  })

  it('should fail with excessive children', () => {
    const c = Capacity.create(2, 15)
    expect(c.isFail).toBe(true)
  })

  it('should check accommodation', () => {
    const c = Capacity.create(3, 1).value
    expect(c.accommodates(2)).toBe(true)
    expect(c.accommodates(3, 1)).toBe(true)
    expect(c.accommodates(4)).toBe(false)
    expect(c.accommodates(3, 2)).toBe(false)
  })

  it('should format string', () => {
    expect(Capacity.create(2).value.toString()).toBe('2 adultos')
    expect(Capacity.create(2, 2).value.toString()).toBe('2 adultos + 2 crianças')
  })

  it('should serialize to JSON', () => {
    const c = Capacity.create(2, 1).value
    expect(c.toJSON()).toEqual({
      maxAdults: 2,
      maxChildren: 1,
      maxTotal: 3,
    })
  })
})
