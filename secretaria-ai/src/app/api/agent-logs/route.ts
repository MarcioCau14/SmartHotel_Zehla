import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const agentId = searchParams.get('agentId') || undefined;

    const where: Record<string, unknown> = {};
    if (agentId) {
      where.agentId = agentId;
    }

    const logs = await db.agentLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(
      logs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('[AGENT_LOGS_GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar logs de agente' },
      { status: 500 }
    );
  }
}