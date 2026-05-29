import { Result } from '../../shared/Result'
import { Plan, Feature, FEATURE_MAP } from '../enums'

export class FeatureSet {
  private readonly features: Set<Feature>

  private constructor(features: Feature[]) {
    this.features = new Set(features)
    Object.freeze(this)
  }

  static fromPlan(plan: Plan): FeatureSet {
    const features = FEATURE_MAP[plan]
    return new FeatureSet([...features])
  }

  static create(features: Feature[]): Result<FeatureSet, string> {
    if (features.length === 0) {
      return Result.fail('FeatureSet must contain at least one feature')
    }
    return Result.ok(new FeatureSet([...features]))
  }

  static restore(features: Feature[]): FeatureSet {
    return new FeatureSet([...features])
  }

  hasFeature(feature: Feature): boolean {
    return this.features.has(feature)
  }

  getFeatures(): Feature[] {
    return Array.from(this.features)
  }

  equals(other: FeatureSet): boolean {
    if (this.features.size !== other.features.size) return false
    for (const f of this.features) {
      if (!other.features.has(f)) return false
    }
    return true
  }
}
