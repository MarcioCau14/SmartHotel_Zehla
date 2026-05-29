import { Result } from '../../../domain/shared/Result'
import { Property } from '../../../domain/property/entities/Property'
import { IPropertyRepository } from '../ports/IPropertyRepository'
import { CadasturService } from '../../../domain/property/services/CadasturService'

export interface VerificarCadasturInput {
  propertyId?: string
}

export interface VerificarCadasturOutput {
  propertyId: string
  cadasturNumber: string
  statusChanged: boolean
}

export class VerificarCadasturUseCase {
  constructor(
    private propertyRepo: IPropertyRepository,
    private cadasturService: CadasturService
  ) {}

  async execute(input: VerificarCadasturInput): Promise<Result<VerificarCadasturOutput[], string>> {
    let properties: Property[] = []

    if (input.propertyId) {
      const single = await this.propertyRepo.findById(input.propertyId)
      if (!single) return Result.fail('Property não encontrada')
      if (!single.cadastur) return Result.ok([])
      properties = [single]
    } else {
      const expiring = await this.propertyRepo.findCadasturExpiring(30)
      const expired = await this.propertyRepo.findCadasturExpired()
      properties = [...expiring, ...expired]
    }

    const results: VerificarCadasturOutput[] = []

    for (const property of properties) {
      if (!property.cadastur) continue

      const checked = this.cadasturService.checkExpiry(property.cadastur)
      const statusChanged = checked.status !== property.cadastur.status

      if (statusChanged) {
        property.updateCadastur(checked)
        await this.propertyRepo.save(property)
      }

      results.push({
        propertyId: property.id,
        cadasturNumber: property.cadastur.number,
        statusChanged,
      })
    }

    return Result.ok(results)
  }
}
