import { describe, it, expect } from 'vitest'
import { TrialPeriod } from '../../../../src/domain/property/value-objects/TrialPeriod'

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

describe('TrialPeriod', () => {
  it('should create trial with default 7 days', () => {
    const result = TrialPeriod.create(daysAgo(0))
    expect(result.isOk).toBe(true)
    expect(result.value.isActive()).toBe(true)
    expect(result.value.isExpired()).toBe(false)
    expect(result.value.notificationSent).toBe(false)
  })

  it('should fail with future start date', () => {
    const result = TrialPeriod.create(daysFromNow(1))
    expect(result.isFail).toBe(true)
  })

  it('should fail with duration less than 1 day', () => {
    const result = TrialPeriod.create(daysAgo(0), 0)
    expect(result.isFail).toBe(true)
  })

  it('should detect expired trial', () => {
    const result = TrialPeriod.create(daysAgo(10), 7)
    expect(result.isOk).toBe(true)
    expect(result.value.isExpired()).toBe(true)
    expect(result.value.isActive()).toBe(false)
  })

  it('should calculate days remaining', () => {
    const tp = TrialPeriod.create(daysAgo(3), 7).value
    const days = tp.daysRemaining(daysFromNow(0))
    expect(days).toBe(4)
  })

  it('should return negative days remaining for expired', () => {
    const tp = TrialPeriod.create(daysAgo(10), 7).value
    const days = tp.daysRemaining(daysFromNow(0))
    expect(days).toBeLessThan(0)
  })

  it('should detect notification needed on day 6', () => {
    const tp = TrialPeriod.create(daysAgo(5), 7).value
    expect(tp.shouldNotifyDay6(daysFromNow(0))).toBe(true)
  })

  it('should not notify if already notified', () => {
    const tp = TrialPeriod.create(daysAgo(5), 7).value
    const notified = tp.markNotificationSent()
    expect(notified.notificationSent).toBe(true)
    expect(notified.shouldNotifyDay6(daysFromNow(0))).toBe(false)
  })

  it('should not notify with more than 2 days remaining', () => {
    const tp = TrialPeriod.create(daysAgo(1), 7).value
    expect(tp.shouldNotifyDay6(daysFromNow(0))).toBe(false)
  })

  it('should be immutable - markNotificationSent returns new instance', () => {
    const tp = TrialPeriod.create(daysAgo(0)).value
    tp.markNotificationSent()
    expect(tp.notificationSent).toBe(false)
  })

  it('should be immutable - expire returns new instance', () => {
    const tp = TrialPeriod.create(daysAgo(0)).value
    tp.expire()
    expect(tp.isExpired()).toBe(false)
  })

  it('should expire explicitly', () => {
    const tp = TrialPeriod.create(daysAgo(0)).value
    const expired = tp.expire()
    expect(expired.isExpired()).toBe(true)
    expect(expired.isActive()).toBe(false)
  })

  it('should check equality', () => {
    const date = daysAgo(0)
    const a = TrialPeriod.create(date).value
    const b = TrialPeriod.create(date).value
    expect(a.equals(b)).toBe(true)
  })
})
