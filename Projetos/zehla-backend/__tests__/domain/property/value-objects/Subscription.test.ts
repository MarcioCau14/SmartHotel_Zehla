import { describe, it, expect } from 'vitest'
import { Subscription } from '../../../../src/domain/property/value-objects/Subscription'
import { Plan, SubscriptionStatus } from '../../../../src/domain/property/enums'

function futureDate(days: number = 30): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

describe('Subscription', () => {
  const validProps = {
    plan: Plan.PRO,
    status: SubscriptionStatus.ACTIVE,
    currentPeriodEnd: futureDate(),
    cancelAtPeriodEnd: false,
    externalSubscriptionId: 'sub_abc123',
  }

  it('should create valid subscription', () => {
    const result = Subscription.create(validProps)
    expect(result.isOk).toBe(true)
    expect(result.value.plan).toBe(Plan.PRO)
    expect(result.value.status).toBe(SubscriptionStatus.ACTIVE)
    expect(result.value.externalSubscriptionId).toBe('sub_abc123')
  })

  it('should fail with empty external subscription ID', () => {
    const result = Subscription.create({ ...validProps, externalSubscriptionId: '' })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('ID')
  })

  it('should fail with past currentPeriodEnd', () => {
    const past = new Date('2020-01-01')
    const result = Subscription.create({ ...validProps, currentPeriodEnd: past })
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('future')
  })

  it('should detect active status', () => {
    const sub = Subscription.create(validProps).value
    expect(sub.isActive()).toBe(true)
  })

  it('should detect past due', () => {
    const sub = Subscription.create({ ...validProps, status: SubscriptionStatus.PAST_DUE }).value
    expect(sub.isPastDue()).toBe(true)
    expect(sub.isActive()).toBe(false)
  })

  it('should detect canceled', () => {
    const sub = Subscription.create({ ...validProps, status: SubscriptionStatus.CANCELED }).value
    expect(sub.isCanceled()).toBe(true)
  })

  it('should mark cancellation at period end', () => {
    const sub = Subscription.create(validProps).value
    const canceled = sub.cancel()
    expect(canceled.cancelAtPeriodEnd).toBe(true)
    expect(sub.cancelAtPeriodEnd).toBe(false) // immutable
  })

  it('should change plan', () => {
    const sub = Subscription.create(validProps).value
    const upgraded = sub.changePlan(Plan.MAX)
    expect(upgraded.plan).toBe(Plan.MAX)
    expect(sub.plan).toBe(Plan.PRO) // immutable
  })

  it('should check equality', () => {
    const a = Subscription.create(validProps).value
    const b = Subscription.create(validProps).value
    expect(a.equals(b)).toBe(true)
  })
})
