import { Result } from '../../shared/Result'
import { Plan, Feature, FEATURE_MAP } from '../enums'
import { FeatureSet } from '../value-objects/FeatureSet'

export class PlanFeatureService {
  getFeatures(plan: Plan): FeatureSet {
    return FeatureSet.fromPlan(plan)
  }

  hasFeature(plan: Plan, feature: Feature): boolean {
    return FeatureSet.fromPlan(plan).hasFeature(feature)
  }

  getFeatureList(): Feature[] {
    return Object.values(Feature)
  }

  validatePlanUpgrade(currentPlan: Plan, newPlan: Plan): Result<void, string> {
    if (currentPlan === newPlan) {
      return Result.fail('O plano já é o plano atual')
    }

    if (currentPlan === Plan.EARLY_ADOPTER) {
      return Result.fail('Planos Early Adopter não podem ser alterados')
    }

    if (currentPlan === Plan.BETA_TESTER) {
      return Result.fail('Planos Beta Tester não podem ser alterados')
    }

    const planHierarchy: Record<Plan, number> = {
      [Plan.FREE]: -2,
      [Plan.LITE]: 0,
      [Plan.PRO]: 1,
      [Plan.MAX]: 2,
      [Plan.BETA_TESTER]: -1,
      [Plan.EARLY_ADOPTER]: -1,
    }

    if (planHierarchy[newPlan] <= planHierarchy[currentPlan]) {
      return Result.fail('Apenas upgrade de plano é permitido')
    }

    return Result.ok(undefined)
  }
}
