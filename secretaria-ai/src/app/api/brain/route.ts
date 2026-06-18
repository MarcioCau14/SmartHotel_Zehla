import { NextRequest, NextResponse } from 'next/server';
import { getNeuroRouter } from '@/lib/ai/zaos-neuro-router';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, tier, provider, sessionId, maxLatencyMs, noCache } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'O campo "message" é obrigatório e deve ser uma string.' },
        { status: 400 },
      );
    }

    if (message.length > 50_000) {
      return NextResponse.json(
        { error: 'Mensagem excede o limite de 50.000 caracteres.' },
        { status: 400 },
      );
    }

    const router = getNeuroRouter();

    // Force a specific provider if requested
    if (provider) {
      const providerState = router.getProvider(provider);
      if (!providerState) {
        return NextResponse.json(
          {
            error: `Provider "${provider}" não encontrado.`,
            availableProviders: router.getProviders().map(p => p.registration.id),
          },
          { status: 404 },
        );
      }
      // Check circuit breaker
      if (!providerState.circuitBreaker.allow()) {
        return NextResponse.json(
          {
            error: `Provider "${provider}" está com circuit breaker aberto. Tente novamente em 60 segundos.`,
            circuitState: providerState.circuitBreaker.getState(),
          },
          { status: 503 },
        );
      }
    }

    const startTime = Date.now();

    const result = await router.generate({
      message,
      tier: tier !== undefined ? Number(tier) : undefined,
      provider,
      sessionId,
      maxLatencyMs: maxLatencyMs !== undefined ? Number(maxLatencyMs) : undefined,
      noCache,
    });

    return NextResponse.json({
      provider: result.providerId,
      providerName: result.providerName,
      bucket: result.bucket,
      confidence: result.confidence,
      tier: result.tier,
      latencyMs: result.latencyMs,
      costUsd: result.costUsd,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      cacheHit: result.cacheHit,
      compressionRatio: result.compressionRatio,
      circuitState: result.circuitState,
      budgetLevel: result.budgetLevel,
      thompsonTheta: result.thompsonTheta,
      allThetas: result.allThetas,
      response: result.response,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    console.error('[ZAOS_NEURO_ROUTER_ERROR]', error);

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  const router = getNeuroRouter();
  const budget = router.getBudgetSnapshot();
  const cacheStats = router.getCacheStats();
  const circuitStates = router.getCircuitBreakerStates();

  return NextResponse.json({
    status: 'online',
    service: 'ZaosNeuroRouter — Cérebro ZÉLLA',
    version: '4.0.0',
    engine: 'Thompson Sampling + Circuit Breakers + Budget Guard + Semantic Cache',
    budget,
    cache: cacheStats,
    circuitBreakers: circuitStates,
    providers: router.getProviders().map(p => ({
      id: p.registration.id,
      name: p.registration.name,
      tier: p.registration.tier,
      circuitState: p.circuitBreaker.getState(),
      alpha: p.alpha,
      beta: p.beta,
      estimatedSuccessRate: Math.round((p.alpha / (p.alpha + p.beta)) * 10_000) / 10_000,
      avgLatencyMs: p.totalRequests > 0 ? Math.round(p.totalLatencyMs / p.totalRequests) : p.registration.expectedLatencyMs,
      totalRequests: p.totalRequests,
      costPer1kInput: p.registration.costPer1kInput,
      costPer1kOutput: p.registration.costPer1kOutput,
    })),
  });
}