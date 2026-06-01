import { Result } from '../../../domain/shared/Result'
import { LeadScore } from '../../../domain/lead/value-objects/LeadScore'
import { ILeadRepository } from '../ports/ILeadRepository'
import { IEventBus } from '../ports/IEventBus'
import { IClusterActionService } from '../ports/IClusterActionService'
import { Cluster } from '../../../domain/lead/LeadStatus'

export interface QualifyLeadInput {
  leadId: string
  newScore: number
  reason?: string
}

export class QualifyLeadUseCase {
  constructor(
    private leadRepo: ILeadRepository,
    private clusterActionService: IClusterActionService,
    private eventBus: IEventBus
  ) {}

  async execute(input: QualifyLeadInput): Promise<Result<void, string>> {
    const lead = await this.leadRepo.findById(input.leadId)
    if (!lead) return Result.fail('Lead não encontrado')

    const prevCluster: Cluster = lead.score.cluster

    const newScore = LeadScore.create({ score: input.newScore })
    if (newScore.isFail) return Result.fail(newScore.error)

    const result = lead.qualify(newScore.value)
    if (result.isFail) return Result.fail(result.error)

    await this.leadRepo.update(lead)

    const newCluster = lead.score.cluster
    if (prevCluster !== newCluster) {
      const actions = this.clusterActionService.getActionsForTransition(prevCluster, newCluster)
      if (actions.length > 0) {
        await this.clusterActionService.executeActions(lead.id, actions)
      }
    }

    await this.eventBus.publishMany(lead.events)
    lead.clearEvents()

    return Result.ok(undefined)
  }
}
