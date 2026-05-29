import { Result } from '../../../domain/shared/Result'
import { IPropertyRepository } from '../ports/IPropertyRepository'

export interface ConsumirTokenVozInput {
  propertyId: string
  count: number
}

export interface ConsumirTokenVozOutput {
  id: string
  used: number
  limit: number
  remaining: number
  isExhausted: boolean
}

export class ConsumirTokenVozUseCase {
  constructor(private propertyRepo: IPropertyRepository) {}

  async execute(input: ConsumirTokenVozInput): Promise<Result<ConsumirTokenVozOutput, string>> {
    const property = await this.propertyRepo.findById(input.propertyId)
    if (!property) {
      return Result.fail('Property não encontrada')
    }

    const result = property.consumeVoiceTokens(input.count)
    if (result.isFail) return Result.fail(result.error)

    await this.propertyRepo.save(property)
    property.clearEvents()

    return Result.ok({
      id: property.id,
      used: property.voiceBudget.used,
      limit: property.voiceBudget.limit,
      remaining: property.voiceBudget.remaining(),
      isExhausted: property.voiceBudget.isExhausted(),
    })
  }
}
