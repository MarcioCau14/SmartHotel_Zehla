import { describe, it, expect } from 'vitest'
import { FeatureSet } from '../../../../src/domain/property/value-objects/FeatureSet'
import { Plan, Feature } from '../../../../src/domain/property/enums'

describe('FeatureSet', () => {
  it('should create from LITE plan', () => {
    const fs = FeatureSet.fromPlan(Plan.LITE)
    expect(fs.hasFeature(Feature.COMMISSION_DISCOUNT)).toBe(true)
    expect(fs.hasFeature(Feature.IA_PERSONA)).toBe(false)
    expect(fs.hasFeature(Feature.NEURAL_VOICE)).toBe(false)
  })

  it('should create from PRO plan', () => {
    const fs = FeatureSet.fromPlan(Plan.PRO)
    expect(fs.hasFeature(Feature.COMMISSION_DISCOUNT)).toBe(true)
    expect(fs.hasFeature(Feature.IA_PERSONA)).toBe(true)
    expect(fs.hasFeature(Feature.WHATSAPP_LEARNING)).toBe(true)
    expect(fs.hasFeature(Feature.ADVANCED_REPORTS)).toBe(true)
    expect(fs.hasFeature(Feature.CADASTUR_AUTO)).toBe(true)
    expect(fs.hasFeature(Feature.SUPPLIER_MANAGEMENT)).toBe(false)
    expect(fs.hasFeature(Feature.NEURAL_VOICE)).toBe(false)
    expect(fs.hasFeature(Feature.FNRH_AUTO)).toBe(false)
  })

  it('should create from MAX plan', () => {
    const fs = FeatureSet.fromPlan(Plan.MAX)
    expect(fs.hasFeature(Feature.NEURAL_VOICE)).toBe(true)
    expect(fs.hasFeature(Feature.SUPPLIER_MANAGEMENT)).toBe(true)
    expect(fs.hasFeature(Feature.FNRH_AUTO)).toBe(true)
  })

  it('should create from BETA_TESTER plan with all features', () => {
    const fs = FeatureSet.fromPlan(Plan.BETA_TESTER)
    expect(fs.hasFeature(Feature.NEURAL_VOICE)).toBe(true)
    expect(fs.hasFeature(Feature.FNRH_AUTO)).toBe(true)
    expect(fs.getFeatures().length).toBeGreaterThan(3)
  })

  it('should create from EARLY_ADOPTER plan', () => {
    const fs = FeatureSet.fromPlan(Plan.EARLY_ADOPTER)
    expect(fs.hasFeature(Feature.COMMISSION_DISCOUNT)).toBe(true)
    expect(fs.hasFeature(Feature.IA_PERSONA)).toBe(true)
    expect(fs.hasFeature(Feature.WHATSAPP_LEARNING)).toBe(true)
    expect(fs.hasFeature(Feature.ADVANCED_REPORTS)).toBe(false)
  })

  it('should create from explicit features', () => {
    const result = FeatureSet.create([Feature.COMMISSION_DISCOUNT, Feature.IA_PERSONA])
    expect(result.isOk).toBe(true)
    expect(result.value.hasFeature(Feature.COMMISSION_DISCOUNT)).toBe(true)
    expect(result.value.hasFeature(Feature.NEURAL_VOICE)).toBe(false)
  })

  it('should fail with empty features', () => {
    const result = FeatureSet.create([])
    expect(result.isFail).toBe(true)
  })

  it('should get all features as array', () => {
    const fs = FeatureSet.fromPlan(Plan.LITE)
    const features = fs.getFeatures()
    expect(features).toContain(Feature.COMMISSION_DISCOUNT)
    expect(features.length).toBe(1)
  })

  it('should check equality', () => {
    const a = FeatureSet.fromPlan(Plan.PRO)
    const b = FeatureSet.fromPlan(Plan.PRO)
    const c = FeatureSet.fromPlan(Plan.LITE)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('should restore from persisted data', () => {
    const fs = FeatureSet.restore([Feature.COMMISSION_DISCOUNT, Feature.IA_PERSONA])
    expect(fs.hasFeature(Feature.COMMISSION_DISCOUNT)).toBe(true)
    expect(fs.hasFeature(Feature.IA_PERSONA)).toBe(true)
  })
})
