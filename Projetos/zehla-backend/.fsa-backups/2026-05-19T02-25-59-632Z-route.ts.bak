import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API TERMINAL COGNITIVO
 * Endpoint para buscar logs em tempo real para o ZCC Dashboard Terminal.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const tenantId = searchParams.get('tenantId');
    const minTimestamp = searchParams.get('since') ? new Date(searchParams.get('since')!) : undefined;

    const logs = await prisma.cognitiveTerminalLog.findMany({
      where: {
        tenantId: tenantId || undefined,
        timestamp: minTimestamp ? { gte: minTimestamp } : undefined,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      logs: logs.map(l => ({
        id: l.id,
        level: l.level,
        component: l.component,
        message: l.message,
        metadata: l.metadata,
        timestamp: l.timestamp,
      }))
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Falha ao buscar logs do terminal' }, { status: 500 });
  }
}
