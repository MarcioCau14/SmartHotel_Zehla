import { Result } from '../../../domain/shared/Result'
import { IPropertyRepository } from '../ports/IPropertyRepository'

export interface SuspenderReativarInput {
  propertyId: string
  reason?: string
}

export interface SuspenderReativarOutput {
  id: string
  status: string
}

export class SuspenderReativarUseCase {
  constructor(private propertyRepo: IPropertyRepository) {}

  async suspend(input: SuspenderReativarInput): Promise<Result<SuspenderReativarOutput, string>> {
    const property = await this.propertyRepo.findById(input.propertyId)
    if (!property) {
      return Result.fail('Property não encontrada')
    }

    const result = property.suspend(input.reason ?? '')
    if (result.isFail) return Result.fail(result.error)

    await this.propertyRepo.save(property)
    property.clearEvents()

    return Result.ok({
      id: property.id,
      status: property.status,
    })
  }

  async reactivate(input: { propertyId: string }): Promise<Result<SuspenderReativarOutput, string>> {
    const property = await this.propertyRepo.findById(input.propertyId)
    if (!property) {
      return Result.fail('Property não encontrada')
    }

    const result = property.reactivate()
    if (result.isFail) return Result.fail(result.error)

    await this.propertyRepo.save(property)
    property.clearEvents()

    return Result.ok({
      id: property.id,
      status: property.status,
    })
  }
}
