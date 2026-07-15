import { NextRequest, NextResponse } from 'next/server';
import { getNeuroRouter } from '@/lib/ai/zaos-neuro-router';
import { guardWhatsAppMessage } from '@/lib/ai/whatsapp-guardrails';
import { classifyIntent } from '@/lib/ai/intent-router';
import { retrieveRelevantKnowledge, formatRAGContext } from '@/lib/ai/semantic-rag';
import { executeCognitivePipeline } from '@/lib/ai/cognitive-router';
import { resolveTenantId } from '@/lib/ddc/auth-utils';
import { getLearningStats } from '@/lib/brain/conversation-learner';
import { withSecurity } from '@/lib/security/api-shield';
import { getAuthSession } from '@/lib/auth-guard';

async function postHandler(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    const body = await request.json();
    const { message, tier, provider, sessionId, maxLatencyMs, noCache, systemPrompt = '' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'O campo "message" é obrigatório e deve ser uma string.' },
        { status: 400 },
      );
    }

    if (message.length > 50000) {
      return NextResponse.json(
        { error: 'Mensagem excede o limite de 50.000 caracteres.' },
        { status: 400 },
      );
    }

    // ── Suporte a testes específicos via Query Params ──
    const { searchParams } = new URL(request.url);

    if (searchParams.get('guard') === 'true') {
      const guardResult = guardWhatsAppMessage(message);
      if (!guardResult.safe) {
        return NextResponse.json({ ok: false, blocked: true, guardResult });
      }
      return NextResponse.json({ ok: true, blocked: false, guardResult });
    }

    if (searchParams.get('intent') === 'true') {
      const intentResult = await classifyIntent(message);
      return NextResponse.json({ ok: true, intentResult });
    }

    if (searchParams.get('rag') === 'true') {
      if (!tenantId) return NextResponse.json({ error: 'Tenant ID obrigatório para RAG' }, { status: 400 });
      const ragResult = await retrieveRelevantKnowledge(tenantId, message);
      const contextText = formatRAGContext(ragResult);
      return NextResponse.json({ ok: true, ragResult, contextText });
    }

    // ── Pipeline Cognitivo (Padrão Fase 2) ──
    if (!tenantId) return NextResponse.json({ error: 'Tenant ID obrigatório' }, { status: 400 });
    const result = await executeCognitivePipeline({
      message,
      tenantId,
      sessionId,
      systemPrompt,
    });

    return NextResponse.json({
      success: result.success,
      provider: result.providerId,
      intent: result.intent,
      confidence: result.confidence,
      tier: result.tierUsed,
      latencyMs: 0,
      isMock: result.isMock,
      requiresHumanHandover: result.requiresHumanHandover,
      securityAlerts: result.securityAlerts,
      toolCalls: result.toolCalls,
      searchStats: result.searchStats,
      response: result.response,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    console.error('[BRAIN_ROUTE_ERROR]', error);

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}

async function getHandler(_request: NextRequest) {
  try {
    const router = await getNeuroRouter();
    const budget = router.getBudgetSnapshot();
    const cacheStats = router.getCacheStats();
    const circuitStates = router.getCircuitBreakerStates();

    // v2.0: Buscar métricas de aprendizado (self-learning)
    let learning = undefined;
    try {
      const tenantId = await resolveTenantId();
      if (tenantId) {
        const stats = await getLearningStats(tenantId);
        learning = {
          totalPatterns: stats.totalPatterns,
          verifiedPatterns: stats.verifiedPatterns,
          antiPatternsCount: stats.antiPatternsCount || 0,
          learningVelocity: stats.learningVelocity || 0,
          avgSentimentScore: stats.avgSentimentScore || 0,
        };
      }
    } catch {
      // Sem tenant disponível (ZCC não tem tenant) — sem dados de learning
    }

    return NextResponse.json({
      status: 'online',
      service: 'ZaosNeuroRouter — Cérebro ZÉLLA',
      version: '5.1.0',
      phase2: {
        guardrails: 'active',
        intentRouter: 'active',
        embedder: 'active',
        semanticRag: 'active',
        toolCalling: 'active',
        selfLearning: 'active',
      },
      engine: 'Thompson Sampling + Circuit Breakers + Budget Guard + Semantic Cache + Self-Learning v2.0',
      budget,
      cache: cacheStats,
      circuitBreakers: circuitStates,
      learning,
      providers: router.getProviders().map(p => ({
        id: p.registration.id,
        name: p.registration.name,
        tier: p.registration.tier,
        circuitState: p.circuitBreaker.getState(),
        alpha: p.alpha,
        beta: p.beta,
        estimatedSuccessRate: Math.round((p.alpha / (p.alpha + p.beta)) * 10000) / 10000,
        avgLatencyMs: p.totalRequests > 0 ? Math.round(p.totalLatencyMs / p.totalRequests) : p.registration.expectedLatencyMs,
        totalRequests: p.totalRequests,
        costPer1kInput: p.registration.costPer1kInput,
        costPer1kOutput: p.registration.costPer1kOutput,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 },
    );
  }
}

export const POST = withSecurity(postHandler, { routeLabel: 'brain', maxPayloadBytes: 500_000 });
export const GET = withSecurity(getHandler, { routeLabel: 'brain-status' });