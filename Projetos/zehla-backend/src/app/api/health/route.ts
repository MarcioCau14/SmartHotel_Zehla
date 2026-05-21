import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

/**
 * Health Check Endpoint
 * 
 * GET /api/health
 * 
 * Verifica status de todos os componentes críticos:
 * - PostgreSQL (Prisma)
 * - Redis
 * - BullMQ Queues (via Redis)
 * 
 * Usado por:
 * - Vercel health checks
 * - Monitoramento externo (UptimeRobot, Pingdom)
 * - Chaos engineering tests
 */

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, { status: 'up' | 'down' | 'degraded'; latency?: number; error?: string }> = {};

  // 1. PostgreSQL Health Check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'up',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 2. Redis Health Check
  try {
    const redisStart = Date.now();
    await redis.ping();
    checks.redis = {
      status: 'up',
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    checks.redis = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 3. BullMQ Queues Health Check
  try {
    const queues = ['zehla-channel-sync', 'zehla-public-webhooks'];
    checks.queues = { status: 'up' as const };

    for (const queueName of queues) {
      try {
        const queueLength = await redis.llen(`bull:${queueName}:wait`);
        (checks.queues as any)[queueName] = { waiting: queueLength };
      } catch {
        (checks.queues as any)[queueName] = { error: 'Unable to check' };
      }
    }
  } catch (error) {
    checks.queues = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 4. Determine overall status
  const hasDown = Object.values(checks).some(c => c.status === 'down');
  const overallStatus = hasDown ? 'degraded' : 'ok';
  const totalLatency = Date.now() - startTime;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      latency: totalLatency,
      version: process.env.npm_package_version || 'development',
      checks,
    },
    {
      status: hasDown ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
