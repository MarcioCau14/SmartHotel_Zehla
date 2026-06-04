import { Worker, Queue } from 'bullmq'
import { redisWorker } from '../../lib/redis'
import { ProcessSocialInteractionUseCase } from '../../application/crm/use-cases/ProcessSocialInteractionUseCase'

export const SOCIAL_QUEUE_NAME = 'social_interactions_queue'
export const SOCIAL_DLQ_NAME = 'social_interactions_dlq'

export interface SocialJobPayload {
  platform: string
  username: string
  content: string
  timestamp: number
  isDirectMessage: boolean
}

export function createSocialWorker(useCase: ProcessSocialInteractionUseCase): Worker {
  const worker = new Worker<SocialJobPayload>(
    SOCIAL_QUEUE_NAME,
    async (job) => {
      const { platform, username, content, timestamp, isDirectMessage } = job.data

      if (!platform || !['INSTAGRAM', 'FACEBOOK', 'WHATSAPP_STATUS'].includes(platform)) {
        throw new Error('INVALID_JOB: platform inválida')
      }
      if (!username || typeof username !== 'string') {
        throw new Error('INVALID_JOB: username é obrigatório')
      }
      if (!content || typeof content !== 'string') {
        throw new Error('INVALID_JOB: content é obrigatório')
      }

      const result = await useCase.execute({
        platform: platform as 'INSTAGRAM' | 'FACEBOOK' | 'WHATSAPP_STATUS',
        username,
        content,
        timestamp: timestamp ?? Date.now(),
        isDirectMessage: isDirectMessage ?? false,
      })

      if (result.isFail) {
        throw new Error(result.error.message)
      }

      return { processed: true }
    },
    {
      connection: redisWorker,
      concurrency: 10,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  )

  worker.on('completed', (job) => {
    console.log(`[SocialWorker] Job ${job.id} concluído — @${job.data.username} (${job.data.platform})`)
  })

  worker.on('failed', async (job, err) => {
    if (job && (job.attemptsMade ?? 0) >= (job.opts?.attempts ?? 3)) {
      try {
        const dlq = new Queue(SOCIAL_DLQ_NAME, { connection: redisWorker })
        await dlq.add(job.name, job.data, {
          jobId: `${job.id}_dlq`,
          attempts: 1,
        })
        console.log(`[SocialWorker] Job ${job.id} movido para DLQ após esgotar retries`)
        await dlq.close()
      } catch (dlqErr) {
        console.error(`[SocialWorker] Falha ao mover job ${job?.id} para DLQ:`, dlqErr)
      }
    }
  })

  return worker
}
