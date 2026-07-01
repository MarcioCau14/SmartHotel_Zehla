import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createError, apiSuccess } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK = 10 } = body;

    if (!query || typeof query !== 'string') {
      return createError(400, 'MISSING_QUERY', 'query é obrigatória');
    }

    const entries = await db.knowledgeEntry.findMany({
      where: {
        OR: [
          { question: { contains: query, mode: 'insensitive' } as any },
          { answer: { contains: query, mode: 'insensitive' } as any },
        ],
      },
      orderBy: { usage: 'desc' },
      take: Math.min(topK, 50),
    });

    const ranked = entries.map((e) => {
      const qScore = e.question.toLowerCase().includes(query.toLowerCase()) ? 3 : 0;
      const aScore = e.answer.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      return { ...e, score: qScore + aScore + e.effectiveness / 100 };
    }).sort((a, b) => b.score - a.score);

    return apiSuccess({ entries: ranked });
  } catch (error) {
    return createError(500, 'KNOWLEDGE_DEBUG_FAILED', 'Falha ao depurar conhecimento', error instanceof Error ? error.message : undefined);
  }
}
