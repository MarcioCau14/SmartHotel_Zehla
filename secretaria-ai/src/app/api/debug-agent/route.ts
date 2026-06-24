import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context } = body;

    const result = await db.$queryRawUnsafe<Array<{ id: string; content: string; relevance: number }>>(
      `SELECT id, content, 1.0 as relevance FROM knowledge_entries WHERE content LIKE '%' || ? || '%' LIMIT 5`,
      prompt || '',
    );

    const agentLog = await db.agentLog.create({
      data: {
        action: 'debug_agent',
        status: 'completed',
        input: prompt || '',
        output: JSON.stringify(result),
        metadata: JSON.stringify({ context }),
      },
    });

    return NextResponse.json({ success: true, result, logId: agentLog.id });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Debug agent failed' }, { status: 500 });
  }
}
