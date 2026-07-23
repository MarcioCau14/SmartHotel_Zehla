// ============================================================================
// ZÉLLA — Cron: Cérebro Watchdog (1 min)
// ============================================================================
// Endpoint chamado a cada 1 minuto via QStash Schedules (mais barato que
// Vercel Cron 1min que é tier pago).
//
// FUNÇÃO:
//  Apenas verifica thresholds hard (sem LLM, para não custar $).
//  Se threshold estourado, cria AnomalyEvent para próxima análise do
//  endpoint /api/cron/cerebro-analyze (a cada 15 min) investigar com GLM.
//
// AUTH:
//  - Em produção: INTERNAL_ENDPOINT_TOKEN (header X-Internal-Token)
//  - Em dev: sem auth (para teste manual)
//
// PLACEHOLDER v1:
//  Esta versão apenas valida que o endpoint funciona e registra heartbeat.
//  Implementação completa do AnomalyDetector vem no Passo 4 do roadmap.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logSink } from '@/lib/cerebro/log-sink';
import { getCerebroMode } from '@/lib/cerebro/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  return runWatchdog(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return runWatchdog(request);
}

async function runWatchdog(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const mode = getCerebroMode();

  // ── Auth (apenas em produção) ──
  if (process.env.NODE_ENV === 'production') {
    const expectedToken = process.env.INTERNAL_ENDPOINT_TOKEN;
    if (!expectedToken) {
      console.error('[cerebro-watchdog] CRÍTICO: INTERNAL_ENDPOINT_TOKEN não configurado em produção');
      return NextResponse.json(
        { ok: false, error: 'INTERNAL_ENDPOINT_TOKEN_NOT_SET' },
        { status: 503 }
      );
    }
    const receivedToken = request.headers.get('x-internal-token');
    if (receivedToken !== expectedToken) {
      console.warn('[cerebro-watchdog] Token inválido — rejeitando');
      return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }
  }

  try {
    // ── 1. Heartbeat — registra que o watchdog está vivo ──
    // Em mock mode, apenas loga. Em live mode, persiste no DB para auditoria.
    const heartbeat = {
      timestamp: new Date().toISOString(),
      mode,
      uptime: process.uptime(),
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      logSinkStats: logSink.getStats(),
    };

    // ── 2. Verifica thresholds hard (placeholder) ──
    // TODO Passo 4: implementar AnomalyDetector completo com:
    //   - error_rate > 10% em 5min
    //   - p99_latency > 5s
    //   - auth_failures > 50/min
    //   - meta_cost_usd_per_hour > 5
    //   - tenant_message_burst (50+ msgs/min de um tenant)
    //
    // Por enquanto, apenas verificamos se há erros recentes no LogSink buffer
    const recentErrors = logSink.getBuffer().filter(
      e => e.level === 'error' &&
      Date.now() - new Date(e.timestamp).getTime() < 60_000 // último 1 min
    );

    const anomalyDetected = recentErrors.length > 10; // threshold hard: 10+ erros/min

    if (anomalyDetected) {
      // Cria AnomalyEvent para próxima análise do cerebro-analyze
      await db.anomalyEvent.create({
        data: {
          anomalyType: 'error_spike',
          scope: 'global',
          metric: 'errors_per_min',
          observed: recentErrors.length,
          baseline: 2, // baseline mock: 2 erros/min é normal
          deviation: (recentErrors.length - 2) / 2,
          detectionMethod: 'threshold',
        },
      });

      logSink.warn({
        module: 'cerebro-watchdog',
        event: 'anomaly_detected',
        message: `Anomaly detected: ${recentErrors.length} errors in last 1 min (baseline 2)`,
        context: {
          observed: recentErrors.length,
          baseline: 2,
          recentErrorHashes: recentErrors.map(e => e.errorHash).filter(Boolean).slice(0, 5),
        },
      });
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      ok: true,
      mode,
      timestamp: new Date().toISOString(),
      heartbeat,
      anomalyDetected,
      recentErrorCount: recentErrors.length,
      processingTimeMs: processingTime,
      message: anomalyDetected
        ? 'Anomaly detected — AnomalyEvent created for /api/cron/cerebro-analyze'
        : 'No anomalies detected',
    });
  } catch (error) {
    logSink.error({
      module: 'cerebro-watchdog',
      event: 'watchdog_error',
      message: 'Erro na execução do watchdog',
      error,
    });

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
