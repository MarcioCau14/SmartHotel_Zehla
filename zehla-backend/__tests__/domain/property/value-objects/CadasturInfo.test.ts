import { describe, it, expect } from 'vitest'
import { CadasturInfo } from '../../../../src/domain/property/value-objects/CadasturInfo'
import { CadasturStatus } from '../../../../src/domain/property/enums'

function futureDate(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

describe('CadasturInfo', () => {
  it('should create valid cadastur', () => {
    const result = CadasturInfo.create({
      number: '12345',
      status: CadasturStatus.VALID,
      expiryDate: futureDate(60),
    })
    expect(result.isOk).toBe(true)
    expect(result.value.number).toBe('12345')
    expect(result.value.isValid()).toBe(true)
  })

  it('should fail with empty number', () => {
    const result = CadasturInfo.create({
      number: '',
      status: CadasturStatus.VALID,
      expiryDate: futureDate(60),
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with past expiry date', () => {
    const result = CadasturInfo.create({
      number: '12345',
      status: CadasturStatus.VALID,
      expiryDate: new Date('2020-01-01'),
    })
    expect(result.isFail).toBe(true)
  })

  it('should detect expiring soon', () => {
    const info = CadasturInfo.create({
      number: '12345',
      status: CadasturStatus.VALID,
      expiryDate: futureDate(25),
    }).value
    expect(info.isExpiringSoon()).toBe(true)
    expect(info.isExpiringSoon(15)).toBe(false)
  })

  it('should detect needs renewal when expired', () => {
    const info = CadasturInfo.create({
      number: '12345',
      status: CadasturStatus.EXPIRED,
      expiryDate: futureDate(60),
    }).value
    expect(info.needsRenewal()).toBe(true)
  })

  it('should detect needs renewal when expiring', () => {
    const info = CadasturInfo.create({
      number: '12345',
      status: CadasturStatus.EXPIRING,
      expiryDate: futureDate(60),
    }).value
    expect(info.needsRenewal()).toBe(true)
  })

  it('should check expiry and update to EXPIRED', () => {
    const info = CadasturInfo.create({
      number: '12345',
      status: CadasturStatus.VALID,
      expiryDate: futureDate(60),
    }).value
    const refDate = new Date()
    refDate.setDate(refDate.getDate() + 90)
    const checked = info.checkExpiry(refDate)
    expect(checked.status).toBe(CadasturStatus.EXPIRED)
  })

  it('should check expiry and update to EXPIRING', () => {
    const info = CadasturInfo.create({
      number: '12345',
      status: CadasturStatus.VALID,
      expiryDate: futureDate(60),
    }).value
    const refDate = new Date()
    refDate.setDate(refDate.getDate() + 40)
    const checked = info.checkExpiry(refDate)
    expect(checked.status).toBe(CadasturStatus.EXPIRING)
  })

  it('should keep VALID when far from expiry', () => {
    const info = CadasturInfo.create({
      number: '12345',
      status: CadasturStatus.VALID,
      expiryDate: futureDate(60),
    }).value
    const checked = info.checkExpiry()
    expect(checked.status).toBe(CadasturStatus.VALID)
  })

  it('should check equality', () => {
    const date = futureDate(60)
    const a = CadasturInfo.create({
      number: '12345',
      status: CadasturStatus.VALID,
      expiryDate: date,
    }).value
    const b = CadasturInfo.create({
      number: '12345',
      status: CadasturStatus.VALID,
      expiryDate: date,
    }).value
    expect(a.equals(b)).toBe(true)
  })
})
