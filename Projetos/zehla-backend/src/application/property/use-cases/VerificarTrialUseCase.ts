import { Result } from '../../../domain/shared/Result'
import { IPropertyRepository } from '../ports/IPropertyRepository'

export interface VerificarTrialInput {
  propertyId?: string
}

export interface VerificarTrialOutput {
  propertyId: string
  statusChanged: boolean
  eventsEmitted: string[]
}

export class VerificarTrialUseCase {
  constructor(private propertyRepo: IPropertyRepository) {}

  async execute(input: VerificarTrialInput): Promise<Result<VerificarTrialOutput[], string>> {
    let properties = await this.propertyRepo.findExpiredTrials()
    const expiring = await this.propertyRepo.findExpiringTrials()
    properties = [...properties, ...expiring]

    if (input.propertyId) {
      const single = await this.propertyRepo.findById(input.propertyId)
      if (!single) return Result.fail('Property não encontrada')
      properties = [single]
    }

    const results: VerificarTrialOutput[] = []

    for (const property of properties) {
      const eventsBefore = property.events.length
      const result = property.checkTrial()
      if (result.isFail) continue

      if (property.events.length > eventsBefore) {
        await this.propertyRepo.save(property)
        const eventNames = property.events.slice(eventsBefore).map(e => e.eventName)
        property.clearEvents()

        results.push({
          propertyId: property.id,
          statusChanged: property.status !== 'ACTIVE',
          eventsEmitted: eventNames,
        })
      }
    }

    return Result.ok(results)
  }
}
