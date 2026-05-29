import { describe, it, expect } from 'vitest'
import { LeadScore } from '../../../../src/domain/lead/value-objects/LeadScore'

describe('LeadScore', () => {
  it('should create with score 0', () => {
    const ls = LeadScore.create({ score: 0 })
    expect(ls.isOk).toBe(true)
    expect(ls.value.score).toBe(0)
    expect(ls.value.cluster).toBe('COLD')
  })

  it('should derive HOT cluster for score >= 60', () => {
    const ls = LeadScore.create({ score: 60 })
    expect(ls.value.cluster).toBe('HOT')
  })

  it('should derive WARM cluster for score >= 30', () => {
    const ls = LeadScore.create({ score: 30 })
    expect(ls.value.cluster).toBe('WARM')
    const ls2 = LeadScore.create({ score: 59 })
    expect(ls2.value.cluster).toBe('WARM')
  })

  it('should derive COLD cluster for score < 30', () => {
    const ls = LeadScore.create({ score: 29 })
    expect(ls.value.cluster).toBe('COLD')
  })

  it('should fail with negative score', () => {
    const ls = LeadScore.create({ score: -1 })
    expect(ls.isFail).toBe(true)
  })

  it('should fail with score > 100', () => {
    const ls = LeadScore.create({ score: 101 })
    expect(ls.isFail).toBe(true)
  })

  it('should fail with invalid validationStatus', () => {
    const ls = LeadScore.create({ score: 50, validationStatus: 'unknown' as 'pendente' | 'validado' | 'rejeitado' })
    expect(ls.isFail).toBe(true)
  })

  it('should updateScore and preserve cluster', () => {
    const ls = LeadScore.create({ score: 50 }).value
    const updated = ls.updateScore(70)
    expect(updated.isOk).toBe(true)
    expect(updated.value.score).toBe(70)
    expect(updated.value.cluster).toBe('HOT')
  })

  it('should addScoreDelta with clamping at 100', () => {
    const ls = LeadScore.create({ score: 90 }).value
    const result = ls.addScoreDelta(20)
    expect(result.isOk).toBe(true)
    expect(result.value.score).toBe(100)
  })

  it('should addScoreDelta with clamping at 0', () => {
    const ls = LeadScore.create({ score: 10 }).value
    const result = ls.addScoreDelta(-20)
    expect(result.isOk).toBe(true)
    expect(result.value.score).toBe(0)
  })
})
