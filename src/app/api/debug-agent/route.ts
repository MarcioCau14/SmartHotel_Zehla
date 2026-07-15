import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createError, apiSuccess } from '@/lib/error-handler';
import { withSecurity } from '@/lib/security/api-shield';
import { withAuth, AuthSession } from '@/lib/auth-guard';

/**
 * POST /api/debug-agent
 * 
 * SECURITY (Zero Trust V2):
 * - Blocked entirely in production via api-shield.
 * - Requires authentication even in dev.
 */
async function handler(request: NextRequest, _ctx: { requestId: string }) {
  try {
    const body = await request.json();
    const { agentId, startDate, endDate, limit = 50 } = body;

    const where: Record<string, unknown> = {};
    if (agentId) where.agentId = agentId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const logs = await db.agentLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    });

    const total = logs.length;
    const successCount = logs.filter((l) => l.status === 'success').length;
    const avgLatency = total > 0 ? Math.round(logs.reduce((s, l) => s + l.latencyMs, 0) / total) : 0;
    const totalCost = logs.reduce((s, l) => s + l.costUsd, 0);

    return apiSuccess({
      logs,
      summary: {
        total,
        successRate: total > 0 ? Math.round((successCount / total) * 100) : 0,
        avgLatencyMs: avgLatency,
        totalCostUsd: Math.round(totalCost * 10000) / 10000,
      },
    });
  } catch (error) {
    return createError(
      500,
      'DEBUG_AGENT_FAILED',
      'Falha ao depurar agente',
      error instanceof Error ? error.message : undefined
    );
  }
}

export const POST = withSecurity(handler, { routeLabel: 'debug-agent' });