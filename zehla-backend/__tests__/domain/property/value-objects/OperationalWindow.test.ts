import { describe, it, expect } from 'vitest'
import { OperationalWindow } from '../../../../src/domain/property/value-objects/OperationalWindow'

describe('OperationalWindow', () => {
  it('should create with defaults', () => {
    const result = OperationalWindow.create({})
    expect(result.isOk).toBe(true)
    expect(result.value.checkInHours).toBe(24)
    expect(result.value.cleaningHours).toBe(3)
  })

  it('should create with custom values', () => {
    const result = OperationalWindow.create({ checkInHours: 48, cleaningHours: 6 })
    expect(result.isOk).toBe(true)
    expect(result.value.checkInHours).toBe(48)
    expect(result.value.cleaningHours).toBe(6)
  })

  it('should fail with zero checkInHours', () => {
    const result = OperationalWindow.create({ checkInHours: 0 })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Check-in')
  })

  it('should fail with negative checkInHours', () => {
    const result = OperationalWindow.create({ checkInHours: -1 })
    expect(result.isFail).toBe(true)
  })

  it('should fail with checkInHours exceeding max', () => {
    const result = OperationalWindow.create({ checkInHours: 169 })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('168')
  })

  it('should fail with zero cleaningHours', () => {
    const result = OperationalWindow.create({ cleaningHours: 0 })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Cleaning')
  })

  it('should fail with cleaningHours exceeding max', () => {
    const result = OperationalWindow.create({ cleaningHours: 49 })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('48')
  })

  it('should check equality', () => {
    const a = OperationalWindow.create({ checkInHours: 24, cleaningHours: 3 }).value
    const b = OperationalWindow.create({ checkInHours: 24, cleaningHours: 3 }).value
    const c = OperationalWindow.create({ checkInHours: 48, cleaningHours: 6 }).value
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('should restore from persisted data', () => {
    const restored = OperationalWindow.restore({ checkInHours: 12, cleaningHours: 4 })
    expect(restored.checkInHours).toBe(12)
    expect(restored.cleaningHours).toBe(4)
  })
})
