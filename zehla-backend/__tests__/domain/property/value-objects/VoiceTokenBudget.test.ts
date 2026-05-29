import { describe, it, expect } from 'vitest'
import { VoiceTokenBudget } from '../../../../src/domain/property/value-objects/VoiceTokenBudget'

describe('VoiceTokenBudget', () => {
  it('should create with default limit', () => {
    const result = VoiceTokenBudget.create()
    expect(result.isOk).toBe(true)
    expect(result.value.used).toBe(0)
    expect(result.value.limit).toBe(100000)
  })

  it('should create with custom limit', () => {
    const result = VoiceTokenBudget.create(50000)
    expect(result.isOk).toBe(true)
    expect(result.value.limit).toBe(50000)
  })

  it('should fail with zero or negative limit', () => {
    expect(VoiceTokenBudget.create(0).isFail).toBe(true)
    expect(VoiceTokenBudget.create(-1).isFail).toBe(true)
  })

  it('should restore valid state', () => {
    const result = VoiceTokenBudget.restore(5000, 100000)
    expect(result.isOk).toBe(true)
    expect(result.value.used).toBe(5000)
    expect(result.value.remaining()).toBe(95000)
  })

  it('should fail restore with negative used', () => {
    const result = VoiceTokenBudget.restore(-1, 100000)
    expect(result.isFail).toBe(true)
  })

  it('should fail restore when used exceeds limit', () => {
    const result = VoiceTokenBudget.restore(100, 50)
    expect(result.isFail).toBe(true)
  })

  it('should consume tokens', () => {
    const budget = VoiceTokenBudget.create().value
    const result = budget.consume(1000)
    expect(result.isOk).toBe(true)
    expect(result.value.used).toBe(1000)
    expect(result.value.remaining()).toBe(99000)
  })

  it('should fail consume when exceeding limit', () => {
    const budget = VoiceTokenBudget.create(100).value
    const result = budget.consume(101)
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('exceeded')
  })

  it('should be immutable - consume returns new instance', () => {
    const budget = VoiceTokenBudget.create(100).value
    budget.consume(50)
    expect(budget.used).toBe(0)
  })

  it('should detect exhaustion', () => {
    const budget = VoiceTokenBudget.create(100).value
    const exhausted = budget.consume(100).value
    expect(exhausted.isExhausted()).toBe(true)
  })

  it('should reset used to zero', () => {
    const budget = VoiceTokenBudget.create(100).value
    const consumed = budget.consume(50).value
    const reset = consumed.reset()
    expect(reset.used).toBe(0)
    expect(reset.limit).toBe(100)
  })

  it('should check equality', () => {
    const a = VoiceTokenBudget.create(1000).value
    const b = VoiceTokenBudget.create(1000).value
    const c = VoiceTokenBudget.create(500).value
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })
})
