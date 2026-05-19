import crypto from 'crypto';
import { Worker, Job } from 'bullmq';

import { QUEUE_NAMES, WORKER_CONFIG, EVENT_SCORES, validateQueue } from '@/lib/queues';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';


// src/workers/captureWorker.ts — ZEHLA Brain v4: Estágio 1 (Capture)
// Rate limiting, deduplicação SHA-256, persistência do evento bruto

const RATE_LIMIT_WINDOW = 3600; // 1 hora em segundos
const RATE_LIMIT_MAX = 100;     // Max 100 eventos/hora por email

export const captureWorker = new Worker(
  QUEUE_NAMES.CAPTURE,
  async (job: Job) => {
    const { email, eventType, sessionId, fingerprint, metadata, eventSource } = job.data;

    `);

    // 1. Rate Limiting via Redis
    const rateLimitKey = `brain:rate:${email}`;
    try {
      const current = await redis.incr(rateLimitKey);
      if (current === 1) {
        await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
      }
      if (current > RATE_LIMIT_MAX) {
        
        return { status: 'rate_limited', email, count: current };
      }
    } catch (e) {
      // Redis indisponível — prosseguir sem rate limiting
      console.warn('[Capture] Redis indisponível para rate limiting, prosseguindo...');
    }

    // 2. Deduplicação por Hash SHA-256
    const dedupWindow = Math.floor(Date.now() / 3600000); // Janela de 1h
    const dedupKey = `${email}:${fingerprint || 'none'}:${eventType}:${dedupWindow}`;
    const dedupHash = crypto.createHash('sha256').update(dedupKey).digest('hex');

    const existingEvent = await prisma.leadEvent.findFirst({
      where: { dedupHash },
    });

    if (existingEvent) {
      `);
      return { status: 'duplicate', dedupHash };
    }

    // 3. Calcular score impact
    const scoreImpact = EVENT_SCORES[eventType] || 0;

    // 4. Encaminhar para validação
    await validateQueue.add('validate-event', {
      email: email.toLowerCase().trim(),
      eventType,
      scoreImpact,
      dedupHash,
      sessionId: sessionId || null,
      fingerprint: fingerprint || null,
      eventSource: eventSource || 'api',
      metadata: metadata || {},
      receivedAt: new Date().toISOString(),
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    `);

    return { status: 'captured', email, eventType, scoreImpact, dedupHash };
  },
  {
    connection: redis,
    concurrency: WORKER_CONFIG.concurrency.CAPTURE,
    limiter: WORKER_CONFIG.limiter,
  }
);

captureWorker.on('completed', (job) => {
  // Silencioso em produção
});

captureWorker.on('failed', (job, err) => {
  console.error(`[Capture] Job ${job?.id} falhou:`, err.message);
});

export default captureWorker;
