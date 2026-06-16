import { Worker, Job } from 'bullmq';
import { getBasePrisma } from '../lib/prisma';
import { QUEUE_NAMES, budgetResetQueue } from '../lib/queues';
import { redisWorker } from '../lib/redis';

// src/workers/budgetResetWorker.ts — ZEHLA Brain v4: Budget Reset Cron Job
// Reseta o saldo de voiceTokensUsed de todas as propriedades diariamente às 00:00 UTC

const prisma = getBasePrisma();

export const budgetResetWorker = new Worker(
  QUEUE_NAMES.BUDGET_RESET,
  async (job: Job) => {
    if (job.name === 'RESET_ALL') {
      console.log(`[Budget Reset Worker] Iniciando reset diário de tokens de voz às ${new Date().toISOString()}`);
      
      try {
        const result = await prisma.property.updateMany({
          data: {
            voiceTokensUsed: 0,
          },
        });
        
        console.log(`[Budget Reset Worker] Sucesso: Saldo resetado para ${result.count} propriedades.`);
        return { success: true, count: result.count };
      } catch (err: any) {
        console.error('[Budget Reset Worker] Erro ao resetar saldo no Postgres:', err.message);
        throw err;
      }
    }
    
    return { success: false };
  },
  {
    connection: redisWorker,
    concurrency: 1,
  }
);

budgetResetWorker.on('failed', (job, err) => {
  console.error(`[Budget Reset Worker] Job ${job?.id} falhou:`, err.message);
});

// Agendamento automático (Roda todo dia às 00:00 UTC)
export async function scheduleBudgetReset(): Promise<void> {
  try {
    const jobs = await budgetResetQueue.getRepeatableJobs();
    
    // Remove jobs repetidos existentes para evitar duplicados
    for (const job of jobs) {
      await budgetResetQueue.removeRepeatableByKey(job.key);
    }

    await budgetResetQueue.add(
      'RESET_ALL',
      {},
      {
        repeat: {
          pattern: '0 0 * * *', // Todos os dias às 00:00 UTC
        },
      }
    );

    console.log('✅ [Budget Reset Worker] Cron de reset diário agendado com sucesso (00:00 UTC).');
  } catch (err: any) {
    console.error('❌ [Budget Reset Worker] Falha ao agendar cron:', err.message);
  }
}

// Inicia o agendamento automaticamente caso o ambiente permita
if (process.env.START_WORKERS === 'true' || process.env.NODE_ENV === 'production') {
  scheduleBudgetReset();
}
