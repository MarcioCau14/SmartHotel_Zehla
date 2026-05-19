// src/app/api/events/stats/route.ts — ZEHLA Brain v4: Cognitive Analytics
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const [
      totalEvents,
      statusDistribution,
      clusterDistribution,
      recentTransitions,
      eventTypes,
      actionStatus
    ] = await Promise.all([
      // 1. Total de eventos processados
      prisma.leadEvent.count(),

      // 2. Distribuição por status
      prisma.leadEvent.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // 3. Distribuição de leads por cluster
      prisma.lead.groupBy({
        by: ['cluster'],
        _count: { id: true },
        _avg: { conversionScore: true },
      }),

      // 4. Últimas 20 transições de cluster
      prisma.actionLog.findMany({
        where: { trigger: 'cluster_change' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          createdAt: true,
          actionType: true,
          cluster: true,
          status: true,
          lead: {
            select: { email: true, name: true }
          }
        }
      }),

      // 5. Volume por tipo de evento (Últimos 7 dias)
      prisma.leadEvent.groupBy({
        by: ['type'],
        _count: { id: true },
        where: {
          timestamp: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // 6. Taxa de sucesso das ações
      prisma.actionLog.groupBy({
        by: ['status'],
        _count: { id: true },
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEvents,
          totalLeads: clusterDistribution.reduce((sum, c) => sum + c._count.id, 0),
        },
        pipeline: {
          statuses: statusDistribution.map(s => ({
            status: s.status,
            count: s._count.id
          })),
          eventVolume: eventTypes.map(e => ({
            type: e.type,
            count: e._count.id
          }))
        },
        clusters: clusterDistribution.map(c => ({
          cluster: c.cluster,
          count: c._count.id,
          avgScore: Math.round(c._avg.conversionScore || 0)
        })),
        actions: {
          performance: actionStatus.map(a => ({
            status: a.status,
            count: a._count.id
          })),
          recent: recentTransitions.map(t => ({
            date: t.createdAt,
            lead: t.lead.name || t.lead.email,
            action: t.actionType,
            cluster: t.cluster,
            status: t.status
          }))
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Brain Stats] Erro:', error.message);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar métricas do Brain' },
      { status: 500 }
    );
  }
}
