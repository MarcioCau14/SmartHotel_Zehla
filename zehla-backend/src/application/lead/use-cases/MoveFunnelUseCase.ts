import { Result } from '../../../domain/shared/Result'
import { LeadStatus } from '../../../domain/lead/LeadStatus'
import { FunnelStage } from '../../../domain/lead/LeadStatus'
import { ILeadRepository } from '../ports/ILeadRepository'
import { IEventBus } from '../ports/IEventBus'

export interface MoveFunnelInput {
  leadId: string
  targetStage?: FunnelStage
  targetStatus?: LeadStatus
}

export class MoveFunnelUseCase {
  constructor(
    private leadRepo: ILeadRepository,
    private eventBus: IEventBus
  ) {}

  async execute(input: MoveFunnelInput): Promise<Result<void, string>> {
    const lead = await this.leadRepo.findById(input.leadId)
    if (!lead) return Result.fail('Lead não encontrado')

    if (input.targetStage) {
      const stageResult = lead.moveToStage(input.targetStage)
      if (stageResult.isFail) return Result.fail(stageResult.error)
    }

    if (input.targetStatus) {
      const result = lead.transitionStatus(input.targetStatus)
      if (result.isFail) return Result.fail(result.error)
    }

    await this.leadRepo.update(lead)
    await this.eventBus.publishMany(lead.events)
    lead.clearEvents()

    return Result.ok(undefined)
  }
}
