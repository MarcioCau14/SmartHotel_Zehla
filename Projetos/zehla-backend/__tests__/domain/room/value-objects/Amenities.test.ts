import { describe, it, expect } from 'vitest'
import { Amenities } from '../../../../src/domain/room/value-objects/Amenities'

describe('Amenities', () => {
  it('should create valid amenities', () => {
    const a = Amenities.create(['Ar Condicionado', 'TV', 'Frigobar'])
    expect(a.isOk).toBe(true)
    expect(a.value.items).toEqual(['ar condicionado', 'tv', 'frigobar'])
  })

  it('should normalize case and trim', () => {
    const a = Amenities.create(['  AR CONDICIONADO ', 'TV  '])
    expect(a.isOk).toBe(true)
    expect(a.value.items).toEqual(['ar condicionado', 'tv'])
  })

  it('should fail with empty array', () => {
    const a = Amenities.create([])
    expect(a.isOk).toBe(true)
    expect(a.value.items).toEqual([])
  })

  it('should fail with non-array', () => {
    const a = Amenities.create('tv' as any)
    expect(a.isFail).toBe(true)
  })

  it('should fail with duplicate amenities', () => {
    const a = Amenities.create(['tv', 'tv'])
    expect(a.isFail).toBe(true)
    expect(a.error).toContain('duplicadas')
  })

  it('should fail with too many amenities', () => {
    const items = Array.from({ length: 25 }, (_, i) => `amenity-${i}`)
    const a = Amenities.create(items)
    expect(a.isFail).toBe(true)
    expect(a.error).toContain('20')
  })

  it('should fail with short amenity name', () => {
    const a = Amenities.create(['a'])
    expect(a.isFail).toBe(true)
  })

  it('should fail with long amenity name', () => {
    const a = Amenities.create(['a'.repeat(51)])
    expect(a.isFail).toBe(true)
  })

  it('should check if has amenity', () => {
    const a = Amenities.create(['TV', 'Frigobar']).value
    expect(a.has('tv')).toBe(true)
    expect(a.has('TV')).toBe(true)
    expect(a.has('WiFi')).toBe(false)
  })

  it('should add amenity', () => {
    const a = Amenities.create(['TV']).value
    const result = a.add('WiFi')
    expect(result.isOk).toBe(true)
    expect(result.value.items).toEqual(['tv', 'wifi'])
  })

  it('should remove amenity', () => {
    const a = Amenities.create(['TV', 'WiFi']).value
    const result = a.remove('TV')
    expect(result.items).toEqual(['wifi'])
  })

  it('should count amenities', () => {
    const a = Amenities.create(['TV', 'WiFi', 'Frigobar']).value
    expect(a.count()).toBe(3)
  })

  it('should serialize to JSON', () => {
    const a = Amenities.create(['TV', 'WiFi']).value
    expect(a.toJSON()).toEqual(['tv', 'wifi'])
  })
})
