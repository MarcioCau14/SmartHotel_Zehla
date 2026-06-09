import { Queue } from 'bullmq'
import { Result } from '../../../domain/shared/Result'
import { CampaignOrchestrator, SegmentFilter, CampaignRecipient } from '../../../domain/marketing/services/CampaignOrchestrator'
import { ICampanhaPort } from '../ports/ICampanhaPort'

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
  batchesDispatched: number
  batchSize: number
  estimatedMinutes: number
  scheduleStartAt: string
}

interface BatchJobData {
  campaignId: string
  propertyId: string
  templateId: string
  templateVariables: Record<string, string>
  batchIndex: number
  totalBatches: number
  recipients: CampaignRecipient[]
  sendWindowStart: string
  sendWindowEnd: string
  timezone: string
  baseDelayMs: number
}

export class ExecutarCampanhaMassaUseCase {
  constructor(
    private readonly campanhaPort: ICampanhaPort,
    private readonly orchestrator: CampaignOrchestrator,
    private readonly outboundQueue: Queue,
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
    const batches = this.chunkArray(input.recipients, batchSize)

    const jobs: Array<{
      name: string
      data: BatchJobData
      opts: { delay: number; attempts: number; backoff: { type: 'exponential'; delay: number } }
    }> = []

    for (let i = 0; i < batches.length; i++) {
      const gaussianJitter = Math.floor(Math.random() * 15000)
      const baseDelay = i * 45000
      jobs.push({
        name: 'SendCampaignBatch',
        data: {
          campaignId: input.campanhaId,
          propertyId: input.propriedadeId,
          templateId: input.templateId,
          templateVariables: input.templateVariables,
          batchIndex: i,
          totalBatches: batches.length,
          recipients: batches[i],
          sendWindowStart: input.schedule.sendWindowStart,
          sendWindowEnd: input.schedule.sendWindowEnd,
          timezone: input.schedule.timezone,
          baseDelayMs: baseDelay + gaussianJitter,
        },
        opts: {
          delay: baseDelay + gaussianJitter,
          attempts: 3,
          backoff: { type: 'exponential', delay: 10000 },
        },
      })
    }

    try {
      await this.outboundQueue.addBulk(jobs)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Falha ao enfileirar lotes da campanha'))
    }

    return Result.ok({
      campanhaId: input.campanhaId,
      status: 'em_execucao',
      totalRecipients: input.recipients.length,
      batchesDispatched: batches.length,
      batchSize,
      estimatedMinutes,
      scheduleStartAt: input.schedule.startAt.toISOString(),
    })
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}
