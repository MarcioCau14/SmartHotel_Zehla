import { Result } from '../../../domain/shared/Result'
import { LeadStatus } from '../../../domain/lead/LeadStatus'
import { ILeadRepository } from '../ports/ILeadRepository'
import { IEventBus } from '../ports/IEventBus'

export interface ConvertLeadInput {
  leadId: string
  plan?: string
}

export class ConvertLeadUseCase {
  constructor(
    private leadRepo: ILeadRepository,
    private eventBus: IEventBus
  ) {}

  async execute(input: ConvertLeadInput): Promise<Result<void, string>> {
    const lead = await this.leadRepo.findById(input.leadId)
    if (!lead) return Result.fail('Lead não encontrado')

    const result = lead.transitionStatus(LeadStatus.CONVERTED)
    if (result.isFail) return Result.fail(result.error)

    await this.leadRepo.update(lead)
    await this.eventBus.publishMany(lead.events)
    lead.clearEvents()

    return Result.ok(undefined)
  }
}
