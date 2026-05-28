import { Result } from '../../../domain/shared/Result'
import { Plan, SubscriptionStatus } from '../../../domain/property/enums'
import { Subscription } from '../../../domain/property/value-objects/Subscription'
import { IPropertyRepository } from '../ports/IPropertyRepository'
import { PlanFeatureService } from '../../../domain/property/services/PlanFeatureService'

export interface AlterarPlanoInput {
  propertyId: string
  plan: Plan
  subscription: {
    status: SubscriptionStatus
    currentPeriodEnd: string
    externalSubscriptionId: string
  }
}

export interface AlterarPlanoOutput {
  id: string
  plan: string
  features: string[]
  subscription: {
    status: string
    currentPeriodEnd: string
  }
}

export class AlterarPlanoUseCase {
  constructor(
    private propertyRepo: IPropertyRepository,
    private planFeatureService: PlanFeatureService
  ) {}

  async execute(input: AlterarPlanoInput): Promise<Result<AlterarPlanoOutput, string>> {
    const property = await this.propertyRepo.findById(input.propertyId)
    if (!property) {
      return Result.fail('Property não encontrada')
    }

    const upgradeResult = this.planFeatureService.validatePlanUpgrade(property.plan, input.plan)
    if (upgradeResult.isFail) return Result.fail(upgradeResult.error)

    const subResult = Subscription.create({
      plan: input.plan,
      status: input.subscription.status,
      currentPeriodEnd: new Date(input.subscription.currentPeriodEnd),
      cancelAtPeriodEnd: false,
      externalSubscriptionId: input.subscription.externalSubscriptionId,
    })
    if (subResult.isFail) return Result.fail(subResult.error)

    const result = property.changePlan(input.plan, subResult.value)
    if (result.isFail) return Result.fail(result.error)

    await this.propertyRepo.save(property)
    property.clearEvents()

    const features = this.planFeatureService.getFeatures(input.plan).getFeatures()

    return Result.ok({
      id: property.id,
      plan: property.plan,
      features: features.map(f => f),
      subscription: {
        status: property.subscription!.status,
        currentPeriodEnd: property.subscription!.currentPeriodEnd.toISOString(),
      },
    })
  }
}
