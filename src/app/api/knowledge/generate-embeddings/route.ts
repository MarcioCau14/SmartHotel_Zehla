import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { regenerateEmbeddings } from '@/lib/ai/embedder';
import { resolveTenantId } from '@/lib/ddc/auth-utils';
import { apiRatelimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = await apiRatelimit.limit(`api:${clientIp}:${new URL(request.url).pathname}`);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Muitas requisições.', retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)), 'X-RateLimit-Remaining': '0' } }
    );
  }

  try {
    const tenantId = await resolveTenantId();

    // 1. Validar tenant existe
    if (!tenantId) return NextResponse.json({ error: 'Tenant ID obrigatório' }, { status: 400, headers: { 'X-Security-Shield': 'zero-trust-v2' } });
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: 'Tenant inválido ou não autenticado.' },
        { status: 404, headers: { 'X-Security-Shield': 'zero-trust-v2' } },
      );
    }

    // 2. Contar entradas antes da geração
    const countBefore = await db.knowledgeEntry.count({
      where: { tenantId },
    });

    if (countBefore === 0) {
      return NextResponse.json({
        ok: true,
        message: 'Nenhuma pergunta/resposta encontrada na base de conhecimento para gerar embeddings.',
        entriesProcessed: 0,
        vocabSize: 0,
      }, { headers: { 'X-Security-Shield': 'zero-trust-v2' } });
    }

    // 3. Gerar e persistir embeddings locally
    const entriesProcessed = await regenerateEmbeddings(tenantId);

    // 4. Calcular o vocabulário local resultante
    const allEntries = await db.knowledgeEntry.findMany({
      where: { tenantId },
      select: { question: true, answer: true },
    });

    const { createTfidfEngine } = await import('@/lib/ai/embedder');
    const engine = createTfidfEngine(allEntries.map(e => ({ id: '', question: e.question, answer: e.answer })));

    return NextResponse.json({
      ok: true,
      message: `Embeddings locais do vocabulário gerados com sucesso para ${entriesProcessed} perguntas/respostas.`,
      entriesProcessed,
      vocabSize: engine.getVocabSize(),
    }, { headers: { 'X-Security-Shield': 'zero-trust-v2' } });
  } catch (error) {
    console.error('[GENERATE_EMBEDDINGS_ROUTE_ERROR]', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500, headers: { 'X-Security-Shield': 'zero-trust-v2' } },
    );
  }
}