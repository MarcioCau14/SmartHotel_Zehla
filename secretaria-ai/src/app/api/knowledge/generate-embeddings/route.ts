import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { regenerateEmbeddings } from '@/lib/ai/embedder';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();

    // 1. Validar tenant existe
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: 'Tenant inválido ou não autenticado.' },
        { status: 404 },
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
      });
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
    });
  } catch (error) {
    console.error('[GENERATE_EMBEDDINGS_ROUTE_ERROR]', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
