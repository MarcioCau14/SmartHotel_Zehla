import { Worker, Job } from 'bullmq';

import { QUEUE_NAMES, WORKER_CONFIG } from '@/lib/queues';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

// src/workers/actWorker.ts — ZEHLA Brain v4: Estágio 5 (Act)
// Executa a "Next Best Action" com base no cluster e perfil do lead

export const actWorker = new Worker(
  QUEUE_NAMES.ACT,
  async (job: Job) => {
    const { leadId, newCluster, clusterChanged, eventType } = job.data;

    if (!leadId) {
      throw new Error('[Act] leadId ausente no payload');
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        email: true,
        name: true,
        cluster: true,
        funnelStage: true,
        conversionScore: true,
        whatsapp: true,
      },
    });

    if (!lead) {
      throw new Error(`[Act] Lead não encontrado: ${leadId}`);
    }

    const actions: string[] = [];

    // Lógica de Next Best Action por cluster
    if (clusterChanged) {
      if (newCluster === 'HOT') {
        // Lead aquecido — acionar closer via WhatsApp
        actions.push('TRIGGER_WHATSAPP_CLOSER');
        console.log(`[Act] 🔥 Lead HOT detectado: ${lead.email} — acionando closer`);
      } else if (newCluster === 'WARM') {
        // Lead morno — enviar nurturing automatizado
        actions.push('SEND_NURTURING_EMAIL');
        console.log(`[Act] 🌡️ Lead WARM detectado: ${lead.email} — nurturing ativado`);
      } else if (newCluster === 'COLD' && eventType === 'LANDING_VISIT') {
        // Lead frio com visita — retargeting leve
        actions.push('SCHEDULE_RETARGETING');
      }
    }

    return {
      status: 'acted',
      leadId,
      actionsTriggered: actions,
      cluster: newCluster,
    };
  },
  {
    connection: redis,
    concurrency: WORKER_CONFIG.concurrency.ACT ?? 5,
    limiter: WORKER_CONFIG.limiter,
  }
);

actWorker.on('failed', (job, err) => {
  console.error(`[Act] Job ${job?.id} falhou:`, err.message);
});

export default actWorker;
