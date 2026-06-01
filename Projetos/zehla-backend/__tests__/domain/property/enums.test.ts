import { describe, it, expect } from 'vitest'
import {
  PropertyStatus,
  Plan,
  Feature,
  SubscriptionStatus,
  CadasturStatus,
  WhatsappChannelType,
  PROPERTY_STATUS_TRANSITIONS,
  canTransitionPropertyStatus,
  FEATURE_MAP,
} from '../../../src/domain/property/enums'

describe('Property Enums', () => {
  it('should have string values matching keys', () => {
    expect(PropertyStatus.PENDING_SETUP).toBe('PENDING_SETUP')
    expect(PropertyStatus.ACTIVE).toBe('ACTIVE')
    expect(PropertyStatus.SUSPENDED).toBe('SUSPENDED')
    expect(PropertyStatus.CHURNED).toBe('CHURNED')
    expect(PropertyStatus.TRIAL_EXPIRED).toBe('TRIAL_EXPIRED')
  })

  it('should have all Plan values', () => {
    expect(Plan.LITE).toBe('LITE')
    expect(Plan.PRO).toBe('PRO')
    expect(Plan.MAX).toBe('MAX')
    expect(Plan.BETA_TESTER).toBe('BETA_TESTER')
    expect(Plan.EARLY_ADOPTER).toBe('EARLY_ADOPTER')
  })
})

describe('PropertyStatus Transitions', () => {
  it('should allow PENDING_SETUP → ACTIVE', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.PENDING_SETUP, PropertyStatus.ACTIVE)).toBe(true)
  })

  it('should not allow PENDING_SETUP → SUSPENDED', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.PENDING_SETUP, PropertyStatus.SUSPENDED)).toBe(false)
  })

  it('should not allow PENDING_SETUP → CHURNED', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.PENDING_SETUP, PropertyStatus.CHURNED)).toBe(false)
  })

  it('should allow ACTIVE → SUSPENDED', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.ACTIVE, PropertyStatus.SUSPENDED)).toBe(true)
  })

  it('should allow ACTIVE → TRIAL_EXPIRED', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.ACTIVE, PropertyStatus.TRIAL_EXPIRED)).toBe(true)
  })

  it('should allow ACTIVE → CHURNED', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.ACTIVE, PropertyStatus.CHURNED)).toBe(true)
  })

  it('should allow SUSPENDED → ACTIVE', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.SUSPENDED, PropertyStatus.ACTIVE)).toBe(true)
  })

  it('should allow SUSPENDED → CHURNED', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.SUSPENDED, PropertyStatus.CHURNED)).toBe(true)
  })

  it('should not allow SUSPENDED → TRIAL_EXPIRED', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.SUSPENDED, PropertyStatus.TRIAL_EXPIRED)).toBe(false)
  })

  it('should allow TRIAL_EXPIRED → ACTIVE (new subscription)', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.TRIAL_EXPIRED, PropertyStatus.ACTIVE)).toBe(true)
  })

  it('should not allow CHURNED → anything', () => {
    expect(canTransitionPropertyStatus(PropertyStatus.CHURNED, PropertyStatus.ACTIVE)).toBe(false)
    expect(canTransitionPropertyStatus(PropertyStatus.CHURNED, PropertyStatus.SUSPENDED)).toBe(false)
    expect(canTransitionPropertyStatus(PropertyStatus.CHURNED, PropertyStatus.TRIAL_EXPIRED)).toBe(false)
  })

  it('should have CHURNED as terminal', () => {
    expect(PROPERTY_STATUS_TRANSITIONS.get(PropertyStatus.CHURNED)).toEqual([])
  })
})

describe('FEATURE_MAP', () => {
  it('should map LITE plan correctly', () => {
    expect(FEATURE_MAP[Plan.LITE]).toEqual([Feature.COMMISSION_DISCOUNT])
  })

  it('should map PRO plan correctly', () => {
    expect(FEATURE_MAP[Plan.PRO]).toContain(Feature.IA_PERSONA)
    expect(FEATURE_MAP[Plan.PRO]).toContain(Feature.CADASTUR_AUTO)
    expect(FEATURE_MAP[Plan.PRO]).not.toContain(Feature.NEURAL_VOICE)
  })

  it('should map MAX plan with all features', () => {
    expect(FEATURE_MAP[Plan.MAX]).toContain(Feature.NEURAL_VOICE)
    expect(FEATURE_MAP[Plan.MAX]).toContain(Feature.SUPPLIER_MANAGEMENT)
    expect(FEATURE_MAP[Plan.MAX]).toContain(Feature.FNRH_AUTO)
  })

  it('should map BETA_TESTER with all features', () => {
    const allFeatures = Object.values(Feature)
    allFeatures.forEach(f => {
      expect(FEATURE_MAP[Plan.BETA_TESTER]).toContain(f)
    })
  })

  it('should map EARLY_ADOPTER with legacy features', () => {
    expect(FEATURE_MAP[Plan.EARLY_ADOPTER]).toContain(Feature.COMMISSION_DISCOUNT)
    expect(FEATURE_MAP[Plan.EARLY_ADOPTER]).toContain(Feature.IA_PERSONA)
    expect(FEATURE_MAP[Plan.EARLY_ADOPTER]).not.toContain(Feature.ADVANCED_REPORTS)
    expect(FEATURE_MAP[Plan.EARLY_ADOPTER]).not.toContain(Feature.FNRH_AUTO)
  })
})

describe('Other enums', () => {
  it('should have SubscriptionStatus values', () => {
    expect(SubscriptionStatus.ACTIVE).toBe('ACTIVE')
    expect(SubscriptionStatus.PAST_DUE).toBe('PAST_DUE')
    expect(SubscriptionStatus.CANCELED).toBe('CANCELED')
    expect(SubscriptionStatus.TRIALING).toBe('TRIALING')
  })

  it('should have CadasturStatus values', () => {
    expect(CadasturStatus.VALID).toBe('VALID')
    expect(CadasturStatus.EXPIRING).toBe('EXPIRING')
    expect(CadasturStatus.EXPIRED).toBe('EXPIRED')
    expect(CadasturStatus.PENDING).toBe('PENDING')
  })

  it('should have WhatsappChannelType values', () => {
    expect(WhatsappChannelType.GUESTS_ONLY).toBe('GUESTS_ONLY')
    expect(WhatsappChannelType.GUESTS_AND_SUPPLIERS).toBe('GUESTS_AND_SUPPLIERS')
  })
})
