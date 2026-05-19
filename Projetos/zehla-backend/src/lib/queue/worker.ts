import IORedis from 'ioredis';
import { Worker } from 'bullmq';

import { EmailService } from '../email/email-service';
import { SwarmEngine } from '../brain/swarm-engine';


const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

/**
 * ZEHLA EMAIL WORKER
 * Processa envios e sincronizações de e-mail fora da requisição principal.
 */
export const emailWorker = new Worker('email-tasks', async job => {
  `);

  if (job.name === 'TRANSACTIONAL') {
    const { to, templateId, data } = job.data;
    return await EmailService.sendTransactional(to, templateId, data);
  }

  if (job.name === 'CAMPAIGN') {
    // Lógica de sincronização em massa
    
  }
}, { connection });


/**
 * ZEHLA BRAIN WORKER
 * Processa análises cognitivas pesadas e simulações de enxame.
 */
export const brainWorker = new Worker('brain-tasks', async job => {
  
  
  if (job.name === 'RUN_SIMULATION') {
    const { scenarioId } = job.data;
    return await SwarmEngine.runSimulation(scenarioId);
  }

  // Outras tarefas de inteligência...
}, { connection });

emailWorker.on('completed', job => {
  
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ [WORKER] Tarefa ${job?.id} falhou: ${err.message}`);
});
