import { LeadEventType } from '@prisma/client';
import { Worker, Job } from 'bullmq';

import { QUEUE_NAMES, WORKER_CONFIG, enrichQueue } from '@/lib/queues';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';


// src/workers/validateWorker.ts — ZEHLA Brain v4: Estágio 2 (Validate)
// Validação de payload, upsert de lead, deduplicação temporal, persistência do evento

// Tipos de evento válidos (deve corresponder ao enum Prisma)
const VALID_EVENT_TYPES: string[] = [
  'EMAIL_OPEN', 'LINK_CLICK', 'LANDING_VISIT', 'WHATSAPP_OPEN',
  'WHATSAPP_REPLY', 'AD_VIEW', 'TRIAL_STARTED', 'PAYMENT_MADE', 'CONVERSION',
];

export const validateWorker = new Worker(
  QUEUE_NAMES.VALIDATE,
  async (job: Job) => {
    const {
      email, eventType, scoreImpact, dedupHash,
      sessionId, fingerprint, eventSource, metadata,
    } = job.data;

    

    // 1. Validação de payload
    if (!email || !eventType) {
      throw new Error(`Payload inválido: email=${email}, eventType=${eventType}`);
    }

    if (!VALID_EVENT_TYPES.includes(eventType)) {
      throw new Error(`Tipo de evento inválido: ${eventType}`);
    }

    // 2. Upsert do Lead (criar se não existir)
    let lead = await prisma.lead.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name: email.split('@')[0] || 'Lead Anônimo',
          email: email.toLowerCase(),
          source: 'BRAIN_PIPELINE',
          status: 'PROSPECT',
          cluster: 'COLD',
          funnelStage: 'NEUTRAL',
          score: 0,
          conversionScore: 0,
        },
      });

    }

    // 3. Persistir evento no banco
    const event = await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        type: eventType as LeadEventType,
        scoreImpact,
        dedupHash,
        sessionId,
        fingerprint,
        eventSource: eventSource || 'api',
        status: 'validated',
        metadata: metadata || null,
      },
    });

    // 4. Encaminhar para enriquecimento
    await enrichQueue.add('enrich-event', {
      eventId: event.id,
      leadId: lead.id,
      eventType,
      scoreImpact,
      metadata,
      sessionId,
      fingerprint,
    });

    return {
      status: 'validated',
      eventId: event.id,
      leadId: lead.id,
      isNewLead: !lead.createdAt || (Date.now() - new Date(lead.createdAt).getTime() < 5000),
    };
  },
  {
    connection: redis,
    concurrency: WORKER_CONFIG.concurrency.VALIDATE,
    limiter: WORKER_CONFIG.limiter,
  }
);

validateWorker.on('failed', (job, err) => {
  console.error(`[Validate] Job ${job?.id} falhou:`, err.message);
});

export default validateWorker;
