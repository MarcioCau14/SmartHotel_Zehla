import { describe, it, expect } from 'vitest'
import { BillingPeriod } from '../../../../src/domain/financeiro/value-objects/BillingPeriod'

describe('BillingPeriod', () => {
  it('should create valid billing period', () => {
    const start = new Date('2026-03-01')
    const end = new Date('2026-03-05')
    const result = BillingPeriod.create(start, end)
    expect(result.isOk).toBe(true)
    expect(result.value.reference).toBe('2026-03')
  })

  it('should fail when startDate >= endDate', () => {
    const start = new Date('2026-03-05')
    const end = new Date('2026-03-01')
    const result = BillingPeriod.create(start, end)
    expect(result.isFail).toBe(true)
  })

  it('should fail when startDate equals endDate', () => {
    const start = new Date('2026-03-01')
    const end = new Date('2026-03-01')
    const result = BillingPeriod.create(start, end)
    expect(result.isFail).toBe(true)
  })

  it('should calculate nights correctly', () => {
    const start = new Date('2026-03-01')
    const end = new Date('2026-03-05')
    const result = BillingPeriod.create(start, end)
    expect(result.value.nights()).toBe(4)
  })

  it('should calculate single night', () => {
    const start = new Date('2026-03-01')
    const end = new Date('2026-03-02')
    const result = BillingPeriod.create(start, end)
    expect(result.value.nights()).toBe(1)
  })

  it('should generate correct reference format', () => {
    const start = new Date('2026-12-01')
    const end = new Date('2026-12-05')
    const result = BillingPeriod.create(start, end)
    expect(result.value.reference).toBe('2026-12')
  })

  it('should fail with invalid dates', () => {
    const result = BillingPeriod.create(new Date('invalid'), new Date('2026-03-05'))
    expect(result.isFail).toBe(true)
  })
})
