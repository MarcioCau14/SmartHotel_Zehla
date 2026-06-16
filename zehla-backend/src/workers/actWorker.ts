import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, WORKER_CONFIG } from '../lib/queues';
import { redis } from '../lib/redis';

// src/workers/actWorker.ts — ZEHLA Brain v4: Estágio 5 (Act)
// Executa ações automatizadas pós-classificação (ex: alertas, disparos)

export const actWorker = new Worker(
  QUEUE_NAMES.ACT,
  async (job: Job) => {
    console.log(`[Act Worker] Processando job ${job.id} | Ação: ${job.name}`);
    // Lógica futura de despacho e notificações
    return { success: true };
  },
  {
    connection: redis,
    concurrency: WORKER_CONFIG.concurrency.ACT,
    limiter: WORKER_CONFIG.limiter,
  }
);

actWorker.on('failed', (job, err) => {
  console.error(`[Act] Job ${job?.id} falhou:`, err.message);
});
