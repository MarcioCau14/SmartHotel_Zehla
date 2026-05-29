import { describe, it, expect } from 'vitest'
import { BehaviorSignals } from '../../../../src/domain/lead/value-objects/BehaviorSignals'

describe('BehaviorSignals', () => {
  it('should create empty', () => {
    const bs = BehaviorSignals.create({})
    expect(bs.isOk).toBe(true)
  })

  it('should create with intent signals', () => {
    const bs = BehaviorSignals.create({
      intentSignals: 'cliente busca sistema de gestão',
      conversionProbability: 65,
    })
    expect(bs.isOk).toBe(true)
    expect(bs.value.conversionProbability).toBe(65)
  })

  it('should fail with excessive text', () => {
    const bs = BehaviorSignals.create({
      notes: 'x'.repeat(501),
    })
    expect(bs.isFail).toBe(true)
    expect(bs.error).toContain('500')
  })

  it('should fail with conversionProbability < 0', () => {
    const bs = BehaviorSignals.create({ conversionProbability: -1 })
    expect(bs.isFail).toBe(true)
  })

  it('should fail with conversionProbability > 100', () => {
    const bs = BehaviorSignals.create({ conversionProbability: 101 })
    expect(bs.isFail).toBe(true)
  })
})
