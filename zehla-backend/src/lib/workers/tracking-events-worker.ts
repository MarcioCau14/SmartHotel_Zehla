import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { PrismaLeadRepository } from '@/infrastructure/persistence/comercial/PrismaLeadRepository';
import { AtualizarStatusEntregaUseCase } from '@/application/comercial/use-cases/AtualizarStatusEntregaUseCase';

const repository = new PrismaLeadRepository(prisma);
const useCase = new AtualizarStatusEntregaUseCase(repository);

export async function processDeliveryStatusJob(job: Job) {
  const { leadId, status, propriedadeId } = job.data;
  console.log(`⚙️ [TRACKING-WORKER] Processando entrega para Lead ${leadId} com status ${status}`);
  
  const result = await useCase.execute({
    leadId,
    propriedadeId,
    status,
  });

  if (result.isFail) {
    throw new Error(result.error.message);
  }

  return { success: true, leadId: result.value.id };
}

export const trackingEventsWorker = new Worker(
  'tracking-events',
  processDeliveryStatusJob,
  {
    connection: redisWorker,
    concurrency: 5, // Limite estrito de concorrência para evitar Connection Pool Exhaustion
  }
);

trackingEventsWorker.on('completed', (job) => {
  console.log(`✅ [TRACKING-WORKER] Job ${job.id} concluído com sucesso.`);
});

trackingEventsWorker.on('failed', (job, err) => {
  console.error(`❌ [TRACKING-WORKER] Job ${job?.id} falhou:`, err.message);
});
