import { describe, it, expect } from 'vitest'
import { UTMTracking } from '../../../../src/domain/property/value-objects/UTMTracking'

describe('UTMTracking', () => {
  it('should create with empty props', () => {
    const result = UTMTracking.create({})
    expect(result.isOk).toBe(true)
    expect(result.value.isEmpty()).toBe(true)
  })

  it('should create with all fields', () => {
    const result = UTMTracking.create({
      source: 'google',
      medium: 'cpc',
      campaign: 'summer2024',
      content: 'banner1',
      term: 'hotel',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.source).toBe('google')
    expect(result.value.isEmpty()).toBe(false)
  })

  it('should fail if source exceeds 200 chars', () => {
    const result = UTMTracking.create({ source: 'x'.repeat(201) })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('UTM')
  })

  it('should fail if campaign exceeds 200 chars', () => {
    const result = UTMTracking.create({ campaign: 'x'.repeat(201) })
    expect(result.isFail).toBe(true)
  })

  it('should check equality', () => {
    const a = UTMTracking.create({ source: 'google' }).value
    const b = UTMTracking.create({ source: 'google' }).value
    const c = UTMTracking.create({ source: 'facebook' }).value
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('should restore from persisted data', () => {
    const restored = UTMTracking.restore({ source: 'google', medium: 'organic' })
    expect(restored.source).toBe('google')
    expect(restored.medium).toBe('organic')
  })
})
