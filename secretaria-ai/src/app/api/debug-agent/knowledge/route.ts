import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendError } from '@/lib/send-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK = 10 } = body;

    if (!query || typeof query !== 'string') {
      return sendError(400, 'MISSING_QUERY', 'query é obrigatória');
    }

    const entries = await db.knowledgeEntry.findMany({
      where: {
        OR: [
          { question: { contains: query, mode: 'insensitive' } },
          { answer: { contains: query, mode: 'insensitive' } },
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

    return NextResponse.json({ success: true, entries: ranked });
  } catch (error) {
    return sendError(500, 'KNOWLEDGE_DEBUG_FAILED', 'Falha ao depurar conhecimento', error instanceof Error ? error.message : undefined);
  }
}
