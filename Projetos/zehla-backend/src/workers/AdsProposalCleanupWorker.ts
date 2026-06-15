import { Worker, Job } from 'bullmq'
import { redisWorker } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

export const adsProposalCleanupWorker = new Worker(
  'ads-proposal-cleanup',
  async (job: Job) => {
    console.log('⚙️ [WORKER] Iniciando limpeza de propostas pendentes e expiradas do Google Ads...')
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const result = await prisma.adsChangeProposal.deleteMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    })

    console.log(`✅ [WORKER] Limpeza de propostas concluída. Deletadas ${result.count} propostas.`)
    return { deletedCount: result.count }
  },
  {
    connection: redisWorker,
    concurrency: 1,
  }
)

adsProposalCleanupWorker.on('completed', (job) => {
  console.log(`✅ [WORKER] Job ${job.id} de limpeza concluído com sucesso.`)
})

adsProposalCleanupWorker.on('failed', (job, err) => {
  console.error(`❌ [WORKER] Job ${job?.id} de limpeza falhou:`, err)
})
