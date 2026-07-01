import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId || tenantId === 'client-001') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeConversations, totalToday, todayLogs, lastLog] = await Promise.all([
      db.conversationLog.count({ where: { tenantId, status: 'active' } }),
      db.conversationLog.count({ where: { tenantId, createdAt: { gte: today } } }),
      db.aIActivityLog.findMany({
        where: { tenantId, timestamp: { gte: today }, type: 'message' },
      }),
      db.aIActivityLog.findFirst({
        where: { tenantId },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    const averageResponseTime = todayLogs.length > 0
      ? Number((todayLogs.reduce((s, l) => s + (l.duration || 0), 0) / todayLogs.length / 1000).toFixed(1))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        status: 'online' as const,
        isProcessing: false,
        activeConversations,
        totalToday,
        averageResponseTime,
        lastActivity: lastLog?.timestamp || new Date(),
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[DDC ai-status] Prisma error, returning fallback:', error);
    return NextResponse.json({
      success: true,
      data: {
        status: 'online' as const,
        isProcessing: false,
        activeConversations: 0,
        totalToday: 0,
        averageResponseTime: 0,
        lastActivity: new Date(),
      },
      meta: { timestamp: new Date().toISOString(), source: 'fallback-zeros' }
    });
  }
}
