import { Result } from '../../../domain/shared/Result'
import { IPropertyRepository } from '../ports/IPropertyRepository'

export interface AtivarPropertyInput {
  propertyId: string
}

export interface AtivarPropertyOutput {
  id: string
  status: string
  trialEndDate: string | null
}

export class AtivarPropertyUseCase {
  constructor(private propertyRepo: IPropertyRepository) {}

  async execute(input: AtivarPropertyInput): Promise<Result<AtivarPropertyOutput, string>> {
    const property = await this.propertyRepo.findById(input.propertyId)
    if (!property) {
      return Result.fail('Property não encontrada')
    }

    const result = property.activate()
    if (result.isFail) return Result.fail(result.error)

    await this.propertyRepo.save(property)
    property.clearEvents()

    return Result.ok({
      id: property.id,
      status: property.status,
      trialEndDate: property.trialPeriod?.endDate.toISOString() ?? null,
    })
  }
}
