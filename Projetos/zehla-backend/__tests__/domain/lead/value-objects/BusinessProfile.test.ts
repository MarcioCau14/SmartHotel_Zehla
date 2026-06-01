import { describe, it, expect } from 'vitest'
import { BusinessProfile } from '../../../../src/domain/lead/value-objects/BusinessProfile'

describe('BusinessProfile', () => {
  it('should create with minimal props', () => {
    const bp = BusinessProfile.create({ hasWebsite: false })
    expect(bp.isOk).toBe(true)
    expect(bp.value.hasWebsite).toBe(false)
  })

  it('should create with all props', () => {
    const bp = BusinessProfile.create({
      property: 'Pousada Sol Nascente',
      category: 'pousada',
      city: 'Imbituba',
      state: 'SC',
      roomsCount: 12,
      hasWebsite: true,
      googleRating: 4.5,
    })
    expect(bp.isOk).toBe(true)
    expect(bp.value.roomsCount).toBe(12)
    expect(bp.value.googleRating).toBe(4.5)
  })

  it('should fail with negative roomsCount', () => {
    const bp = BusinessProfile.create({ roomsCount: -1, hasWebsite: false })
    expect(bp.isFail).toBe(true)
  })

  it('should fail with googleRating > 5', () => {
    const bp = BusinessProfile.create({ googleRating: 5.5, hasWebsite: false })
    expect(bp.isFail).toBe(true)
  })

  it('should fail with invalid category', () => {
    const bp = BusinessProfile.create({ category: 'skyscraper', hasWebsite: false })
    expect(bp.isFail).toBe(true)
  })

  it('should fail with invalid OTA level', () => {
    const bp = BusinessProfile.create({
      otaDependenceLevel: 'CRITICAL',
      hasWebsite: false,
    })
    expect(bp.isFail).toBe(true)
  })

  it('should fail with negative otaCommissionLost', () => {
    const bp = BusinessProfile.create({
      otaCommissionLost: -100,
      hasWebsite: false,
    })
    expect(bp.isFail).toBe(true)
  })
})
