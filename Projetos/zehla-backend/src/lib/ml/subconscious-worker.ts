import IORedis from 'ioredis';
import { Queue, Worker, Job } from 'bullmq';

import { CognitiveTerminal } from '@/lib/observability/cognitive-terminal';
import { prisma } from '@/lib/prisma';

import { MemoryIngestionService } from './memory-service';
import { SecretariaBridge } from '../intelligence/secretaria-bridge';
import { SelfHealingEngine } from './self-healing-engine';
import { TrialService } from '../billing/trial-service';


const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const subconsciousQueue = new Queue('subconscious-cycle', { connection });

/**
 * SubconsciousWorker — O Processamento em Segundo Plano do Cérebro ZEHLA
 * Realiza as tarefas pesadas de síntese e aprendizado sem bloquear o pipeline do ZMG.
 */
export const subconsciousWorker = new Worker(
  'subconscious-cycle',
  async (job: Job) => {
    const { tenantId, guestId, type } = job.data;

    try {
      switch (type) {
        case 'SUMMARIZE_INTERACTIONS':
          await CognitiveTerminal.info('ML-BRAIN', `Iniciando síntese subconsciente para hóspede ${guestId}`, { tenantId });
          // Aqui chamamos a lógica de sumarização pesada via LLM
          // Por enquanto, delegamos ao MemoryIngestionService
          // Em v2.1, isso usará o ZRouter com hint:summarize
          break;

        case 'CALIBRATE_PERFORMANCE':
          // Analisa logs do terminal e ajusta parâmetros
          break;

        case 'CHECK_TRIALS':
          await CognitiveTerminal.info('BILLING', 'Iniciando verificação de trials expirando');
          const results = await TrialService.checkTrials();
          await CognitiveTerminal.success('BILLING', `Verificação de trials concluída: ${results.notified} notificados, ${results.expired} expirados`);
          break;

        case 'HEAL_SYSTEM':
          const healCount = await SelfHealingEngine.diagnoseAndHeal();
          if (healCount > 0) {
            await CognitiveTerminal.success('SELF-HEALING', `Diagnóstico concluído. ${healCount} protocolos de correção aplicados.`);
          }
          break;

        case 'QUALIFY_LEAD':
          const { leadId } = job.data;
          await CognitiveTerminal.info('SECRETARIA-IA', `Iniciando Raio-X assíncrono para lead ${leadId}`);
          await SecretariaBridge.qualifyLead(leadId);
          await CognitiveTerminal.success('SECRETARIA-IA', `Qualificação do lead ${leadId} concluída com sucesso.`);
          break;

        default:
          console.warn(`[SubconsciousWorker] Tipo de job desconhecido: ${type}`);
      }
    } catch (error) {
      await CognitiveTerminal.error('ML-BRAIN', `Erro no ciclo subconsciente: ${job.id}`, tenantId, error);
      throw error;
    }
  },
  { connection, concurrency: 5 }
);

// Monitoramento de eventos do worker
subconsciousWorker.on('completed', (job) => {
  
});

subconsciousWorker.on('failed', (job, err) => {
  console.error(`[ML-BRAIN] Ciclo subconsciente ${job?.id} falhou:`, err);
});
