import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import {
  captureQueue,
  validateQueue,
  enrichQueue,
  classifyQueue,
  actQueue,
  swipeMatchQueue,
  scraperQueue,
} from '@/lib/queues';
import { redisSession, redisWorker, redisAI } from '@/lib/redis';
import { withApiSecurity } from '@/lib/server/with-api-security';

export const dynamic = 'force-dynamic';

async function _GET() {
  const start = Date.now();

  // 1. Redis — ping each DB
  const redisStatuses = await Promise.allSettled([
    redisSession.ping().then(() => 'OK').catch(() => 'ERROR'),
    redisWorker.ping().then(() => 'OK').catch(() => 'ERROR'),
    redisAI.ping().then(() => 'OK').catch(() => 'ERROR'),
  ]);

  const redis = {
    session: redisStatuses[0].status === 'fulfilled' ? redisStatuses[0].value : 'ERROR',
    worker: redisStatuses[1].status === 'fulfilled' ? redisStatuses[1].value : 'ERROR',
    ai: redisStatuses[2].status === 'fulfilled' ? redisStatuses[2].value : 'ERROR',
  };

  // 2. Database
  let database = 'OK';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'ERROR';
  }

  // 3. BullMQ Queues
  const queueNames = [
    ['capture', captureQueue],
    ['validate', validateQueue],
    ['enrich', enrichQueue],
    ['classify', classifyQueue],
    ['act', actQueue],
    ['swipeMatch', swipeMatchQueue],
    ['scraper', scraperQueue],
  ] as const;

  const queues: Record<string, { waiting: number; active: number; failed: number }> = {};
  for (const [name, q] of queueNames) {
    try {
      const [waiting, active, failed] = await Promise.all([
        q.getWaitingCount(),
        q.getActiveCount(),
        q.getFailedCount(),
      ]);
      queues[name] = { waiting, active, failed };
    } catch {
      queues[name] = { waiting: -1, active: -1, failed: -1 };
    }
  }

  // 4. API error rate in last 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  let errorRate = 0;
  try {
    errorRate = await prisma.cognitiveTerminalLog.count({
      where: {
        level: 'error',
        createdAt: { gte: fiveMinAgo },
      },
    });
  } catch {
    errorRate = -1;
  }

  // 5. Security — recent alerts
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let securityAlerts24h = 0;
  try {
    securityAlerts24h = await prisma.securityAlert.count({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
      },
    });
  } catch {
    securityAlerts24h = -1;
  }

  return NextResponse.json({
    status: redis.session === 'OK' && database === 'OK' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: Date.now() - start,
    redis,
    database,
    queues,
    errorRate5m: errorRate,
    securityAlerts24h,
  });
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 60, windowSeconds: 60 } });
