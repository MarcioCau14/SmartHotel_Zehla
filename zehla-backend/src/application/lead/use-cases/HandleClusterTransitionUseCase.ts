import { Result } from '../../../domain/shared/Result'
import { Cluster } from '../../../domain/lead/LeadStatus'
import { ILeadRepository } from '../ports/ILeadRepository'
import { IClusterActionService } from '../ports/IClusterActionService'
import { IEventBus } from '../ports/IEventBus'

export interface HandleClusterTransitionInput {
  leadId: string
}

export class HandleClusterTransitionUseCase {
  constructor(
    private leadRepo: ILeadRepository,
    private clusterActionService: IClusterActionService,
    private eventBus: IEventBus
  ) {}

  async execute(input: HandleClusterTransitionInput): Promise<Result<void, string>> {
    const lead = await this.leadRepo.findById(input.leadId)
    if (!lead) return Result.fail('Lead não encontrado')

    const prevCluster = lead.funnel.previousCluster as Cluster | undefined
    const currentCluster = lead.score.cluster

    if (!prevCluster || prevCluster === currentCluster) {
      return Result.fail('Nenhuma transição de cluster detectada')
    }

    const actions = this.clusterActionService.getActionsForTransition(prevCluster, currentCluster)
    if (actions.length > 0) {
      await this.clusterActionService.executeActions(lead.id, actions)
    }

    return Result.ok(undefined)
  }
}
