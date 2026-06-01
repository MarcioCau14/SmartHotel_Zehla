import { describe, it, expect } from 'vitest'
import { FunnelPosition } from '../../../../src/domain/lead/value-objects/FunnelPosition'
import { LeadStatus } from '../../../../src/domain/lead/LeadStatus'

describe('FunnelPosition', () => {
  it('should create initial position', () => {
    const fp = FunnelPosition.initial('LANDING_PAGE')
    expect(fp.isOk).toBe(true)
    expect(fp.value.status).toBe(LeadStatus.PROSPECT)
    expect(fp.value.funnelStage).toBe('NEUTRAL')
    expect(fp.value.source).toBe('LANDING_PAGE')
  })

  it('should transition status PROSPECT -> QUALIFIED', () => {
    const fp = FunnelPosition.initial().value
    const result = fp.transitionStatus(LeadStatus.QUALIFIED)
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(LeadStatus.QUALIFIED)
  })

  it('should reject invalid status transition', () => {
    const fp = FunnelPosition.initial().value
    const result = fp.transitionStatus(LeadStatus.CONVERTED)
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('transicionar')
  })

  it('should transition funnel stage NEUTRAL -> AWARE', () => {
    const fp = FunnelPosition.initial().value
    const result = fp.transitionStage('AWARE')
    expect(result.isOk).toBe(true)
    expect(result.value.funnelStage).toBe('AWARE')
  })

  it('should transition funnel stage through full progression', () => {
    const fp = FunnelPosition.initial().value
    const stages = ['AWARE', 'INTERESTED', 'ENGAGED', 'TRIAL', 'CONVERTED'] as const
    let current = fp
    for (const stage of stages) {
      const result = current.transitionStage(stage)
      expect(result.isOk).toBe(true)
      current = result.value
    }
    expect(current.funnelStage).toBe('CONVERTED')
  })

  it('should reject funnel regression', () => {
    const fp = FunnelPosition.initial().value
    const aware = fp.transitionStage('AWARE').value
    const result = aware.transitionStage('NEUTRAL')
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('regredir')
  })

  it('should fail with invalid source', () => {
    const fp = FunnelPosition.create({
      status: LeadStatus.PROSPECT,
      funnelStage: 'NEUTRAL',
      source: 'INVALID_SOURCE' as any,
    })
    expect(fp.isFail).toBe(true)
  })

  it('should fail with tierConfidence out of range', () => {
    const fp = FunnelPosition.create({
      status: LeadStatus.PROSPECT,
      funnelStage: 'NEUTRAL',
      source: 'WHATSAPP',
      tierConfidence: 150,
    })
    expect(fp.isFail).toBe(true)
  })

  it('should transition PROSPECT -> BLACKLISTED', () => {
    const fp = FunnelPosition.initial().value
    const result = fp.transitionStatus(LeadStatus.BLACKLISTED)
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(LeadStatus.BLACKLISTED)
  })
})
