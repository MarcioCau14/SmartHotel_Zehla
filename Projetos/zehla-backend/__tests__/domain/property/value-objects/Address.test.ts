import { describe, it, expect } from 'vitest'
import { Address } from '../../../../src/domain/property/value-objects/Address'

describe('Address', () => {
  const validProps = {
    street: 'Rua das Flores',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
  }

  it('should create valid address', () => {
    const result = Address.create(validProps)
    expect(result.isOk).toBe(true)
    expect(result.value.street).toBe('Rua das Flores')
    expect(result.value.city).toBe('São Paulo')
    expect(result.value.state).toBe('SP')
    expect(result.value.zipCode).toBe('01234-567')
  })

  it('should fail with empty street', () => {
    const result = Address.create({ ...validProps, street: '' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('Street')
  })

  it('should fail with empty city', () => {
    const result = Address.create({ ...validProps, city: '' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('City')
  })

  it('should fail with invalid UF', () => {
    const result = Address.create({ ...validProps, state: 'XX' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('UF')
  })

  it('should fail with invalid CEP format', () => {
    const result = Address.create({ ...validProps, zipCode: '12345678' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('CEP')
  })

  it('should automatically uppercase state', () => {
    const result = Address.create({ ...validProps, state: 'sc' })
    expect(result.isOk).toBe(true)
    expect(result.value.state).toBe('SC')
  })

  it('should generate fullAddress string', () => {
    const result = Address.create(validProps)
    expect(result.value.fullAddress()).toBe('Rua das Flores, São Paulo - SP')
  })

  it('should accept optional coordinates', () => {
    const result = Address.create({ ...validProps, latitude: -23.55, longitude: -46.63 })
    expect(result.isOk).toBe(true)
    expect(result.value.latitude).toBe(-23.55)
    expect(result.value.longitude).toBe(-46.63)
  })

  it('should check equality', () => {
    const a = Address.create(validProps).value
    const b = Address.create(validProps).value
    const c = Address.create({ ...validProps, city: 'Rio' }).value
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('should restore from persisted data', () => {
    const restored = Address.restore(validProps)
    expect(restored.street).toBe('Rua das Flores')
    expect(restored.state).toBe('SP')
  })
})
