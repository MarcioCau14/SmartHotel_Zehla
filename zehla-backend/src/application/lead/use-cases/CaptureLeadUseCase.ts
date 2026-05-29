import { Result } from '../../../domain/shared/Result'
import { Lead } from '../../../domain/lead/entities/Lead'
import { LeadContactInfo } from '../../../domain/lead/value-objects/LeadContactInfo'
import { BusinessProfile } from '../../../domain/lead/value-objects/BusinessProfile'
import { UTMParams } from '../../../domain/lead/value-objects/UTMParams'
import { LeadSource } from '../../../domain/lead/LeadSource'
import { ILeadRepository } from '../ports/ILeadRepository'
import { IDuplicateDetectionService } from '../ports/IDuplicateDetectionService'
import { IEventBus } from '../ports/IEventBus'

export interface CaptureLeadInput {
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  source?: LeadSource
  propertyId?: string
  property?: string
  city?: string
  state?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface CaptureLeadOutput {
  id: string
  name: string
  score: number
  status: string
  isDuplicate: boolean
}

export class CaptureLeadUseCase {
  constructor(
    private leadRepo: ILeadRepository,
    private duplicateService: IDuplicateDetectionService,
    private eventBus: IEventBus
  ) {}

  async execute(input: CaptureLeadInput): Promise<Result<CaptureLeadOutput, string>> {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

    const contactResult = LeadContactInfo.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      whatsapp: input.whatsapp,
    })
    if (contactResult.isFail) return Result.fail(contactResult.error)

    const isDup = await this.duplicateService.isDuplicate(input.email, input.phone ?? input.whatsapp)
    if (isDup) {
      const existingByEmail = input.email ? await this.duplicateService.findByEmail(input.email) : null
      const existingByPhone = input.phone
        ? await this.duplicateService.findByPhone(input.phone)
        : input.whatsapp
          ? await this.duplicateService.findByPhone(input.whatsapp)
          : null
      const existingId = existingByEmail?.id ?? existingByPhone?.id
      if (existingId) {
        const existing = await this.leadRepo.findById(existingId)
        if (existing) {
          if (input.email && !existing.contact.email) {
            const newContact = LeadContactInfo.create({
              ...existing.contact,
              email: input.email,
            })
            if (newContact.isOk) existing.updateContact(newContact.value)
          }
          await this.leadRepo.update(existing)
          return Result.ok({
            id: existing.id,
            name: existing.contact.name,
            score: existing.score.score,
            status: existing.funnel.status,
            isDuplicate: true,
          })
        }
      }
    }

    const businessResult = BusinessProfile.create({
      property: input.property,
      city: input.city,
      state: input.state,
      hasWebsite: false,
    })
    if (businessResult.isFail) return Result.fail(businessResult.error)

    const utm = input.utmSource
      ? UTMParams.create({
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
        }).value
      : undefined

    const leadResult = Lead.create({
      id,
      contact: contactResult.value,
      business: businessResult.value,
      source: input.source ?? 'SECRETARIA_AI',
      propertyId: input.propertyId,
      utm,
    })
    if (leadResult.isFail) return Result.fail(leadResult.error)

    const lead = leadResult.value
    await this.leadRepo.save(lead)
    await this.eventBus.publishMany(lead.events)
    lead.clearEvents()

    return Result.ok({
      id: lead.id,
      name: lead.contact.name,
      score: lead.score.score,
      status: lead.funnel.status,
      isDuplicate: false,
    })
  }
}
