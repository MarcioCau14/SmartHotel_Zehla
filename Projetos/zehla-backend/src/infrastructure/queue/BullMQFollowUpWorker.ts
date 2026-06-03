import { Worker, Queue } from 'bullmq'
import { redisWorker } from '../../lib/redis'
import { ProcessFollowUpUseCase } from '../../application/crm/use-cases/ProcessFollowUpUseCase'
import { FollowUpCadence } from '../../domain/crm/models/FollowUpSchedule'

export const FOLLOWUP_QUEUE_NAME = 'followup-queue'
export const FOLLOWUP_DLQ_NAME = 'followup-dlq'

export interface FollowUpJobPayload {
  leadId: string
  scheduleType: FollowUpCadence
}

export function createFollowUpWorker(useCase: ProcessFollowUpUseCase): Worker {
  const worker = new Worker<FollowUpJobPayload>(
    FOLLOWUP_QUEUE_NAME,
    async (job) => {
      const { leadId, scheduleType } = job.data

      if (!leadId || typeof leadId !== 'string') {
        throw new Error('INVALID_JOB: leadId é obrigatório')
      }
      if (!scheduleType || !['ENGAJAMENTO', 'URGENCIA', 'FECHAMENTO'].includes(scheduleType)) {
        throw new Error(`INVALID_JOB: scheduleType inválido: ${scheduleType}`)
      }

      const result = await useCase.execute({ leadId, scheduleType })
      if (result.isFail) {
        throw new Error(result.error.message)
      }

      return result.value
    },
    {
      connection: redisWorker,
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  )

  worker.on('completed', (job) => {
    console.log(`[FollowUpWorker] Job ${job.id} concluído — lead ${job.data.leadId} (${job.data.scheduleType})`)
  })

  worker.on('failed', async (job, err) => {
    console.error(`[FollowUpWorker] Job ${job?.id} falhou: ${err.message}`)

    if (job && (job.attemptsMade ?? 0) >= (job.opts?.attempts ?? 3)) {
      try {
        const dlq = new Queue(FOLLOWUP_DLQ_NAME, { connection: redisWorker })
        await dlq.add(job.name, job.data, {
          jobId: `${job.id}_dlq`,
          attempts: 1,
        })
        console.log(`[FollowUpWorker] Job ${job.id} movido para DLQ após esgotar retries`)
        await dlq.close()
      } catch (dlqErr) {
        console.error(`[FollowUpWorker] Falha ao mover job ${job?.id} para DLQ:`, dlqErr)
      }
    }
  })

  return worker
}
