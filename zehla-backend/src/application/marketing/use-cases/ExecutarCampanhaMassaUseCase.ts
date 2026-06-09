import { Result } from '../../../domain/shared/Result'
import { Campanha } from '../../../domain/marketing/entities/Campanha'
import { CampaignOrchestrator, SegmentFilter, CampaignRecipient } from '../../../domain/marketing/services/CampaignOrchestrator'
import { ICampanhaPort } from '../ports/ICampanhaPort'
import { IMessagingGateway } from '../ports/IMessagingGateway'

export interface ExecutarCampanhaMassaInput {
  propriedadeId: string
  campanhaId: string
  segmentFilter: SegmentFilter
  templateId: string
  templateVariables: Record<string, string>
  schedule: {
    startAt: Date
    endAt?: Date
    timezone: string
    sendWindowStart: string
    sendWindowEnd: string
  }
  recipients: CampaignRecipient[]
}

export interface ExecutarCampanhaMassaOutput {
  campanhaId: string
  status: string
  totalRecipients: number
  batchSize: number
  estimatedMinutes: number
  scheduleStartAt: string
}

export class ExecutarCampanhaMassaUseCase {
  constructor(
    private readonly campanhaPort: ICampanhaPort,
    private readonly messagingGateway: IMessagingGateway,
    private readonly orchestrator: CampaignOrchestrator,
  ) {}

  async execute(input: ExecutarCampanhaMassaInput): Promise<Result<ExecutarCampanhaMassaOutput, Error>> {
    const campanhaResult = await this.campanhaPort.buscarPorId(input.campanhaId, input.propriedadeId)
    if (campanhaResult.isFail) return Result.fail(campanhaResult.error)
    if (!campanhaResult.value) {
      return Result.fail(new Error('CAMPANHA_NAO_ENCONTRADA'))
    }

    const segmentResult = this.orchestrator.validateSegment(input.segmentFilter)
    if (segmentResult.isFail) return Result.fail(segmentResult.error)

    const scheduleResult = this.orchestrator.validateSchedule(input.schedule)
    if (scheduleResult.isFail) return Result.fail(scheduleResult.error)

    if (!input.recipients || input.recipients.length === 0) {
      return Result.fail(new Error('CAMPANHA_SEM_DESTINATARIOS'))
    }

    const statusResult = await this.campanhaPort.atualizarStatus(
      input.campanhaId,
      input.propriedadeId,
      'em_execucao',
    )
    if (statusResult.isFail) return Result.fail(statusResult.error)

    const batchSize = this.orchestrator.calculateBatchSize(input.recipients.length)
    const estimatedMinutes = this.orchestrator.estimateDurationMinutes(input.recipients.length)

    return Result.ok({
      campanhaId: input.campanhaId,
      status: 'em_execucao',
      totalRecipients: input.recipients.length,
      batchSize,
      estimatedMinutes,
      scheduleStartAt: input.schedule.startAt.toISOString(),
    })
  }
}
