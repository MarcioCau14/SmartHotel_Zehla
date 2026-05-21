import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * Funnel Analytics API
 * 
 * GET /api/funnel/analytics — Métricas gerais do funil
 * GET /api/funnel/analytics?campaign=xxx — Métricas por campanha
 * GET /api/funnel/analytics?cluster=HOT — Leads por cluster
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaign');
    const cluster = searchParams.get('cluster');
    const days = parseInt(searchParams.get('days') || '30');

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // 1. Métricas gerais de eventos
    const eventCounts = await prisma.funnelEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: { gte: dateFrom },
        ...(campaignId && { campaignId }),
      },
      _count: true,
    });

    // 2. Distribuição de clusters
    const clusterCounts = await prisma.lead.groupBy({
      by: ['cluster'],
      where: {
        updatedAt: { gte: dateFrom },
        ...(cluster && { cluster }),
      },
      _count: true,
    });

    // 3. Distribuição de funnel stages
    const stageCounts = await prisma.lead.groupBy({
      by: ['funnelStage'],
      _count: true,
    });

    // 4. Taxa de conversão por campanha
    const campaignStats = await prisma.funnelEvent.groupBy({
      by: ['campaignName'],
      where: {
        campaignName: { not: null },
        createdAt: { gte: dateFrom },
      },
      _count: true,
      orderBy: { _count: 'desc' },
    });

    // 5. Top leads por score
    const topLeads = await prisma.lead.findMany({
      where: {
        conversionScore: { gte: 20 }, // WARM ou HOT
      },
      orderBy: { conversionScore: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        property: true,
        city: true,
        state: true,
        cluster: true,
        funnelStage: true,
        conversionScore: true,
        lastInteractionAt: true,
        createdAt: true,
      },
    });

    // 6. Eventos recentes
    const recentEvents = await prisma.funnelEvent.findMany({
      where: {
        createdAt: { gte: dateFrom },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        lead: {
          select: {
            name: true,
            email: true,
            cluster: true,
          },
        },
      },
    });

    // Calcular métricas derivadas
    const totalEvents = eventCounts.reduce((sum, e) => sum + e._count, 0);
    const openedCount = eventCounts.find(e => e.eventType === 'email_opened')?._count || 0;
    const clickedCount = eventCounts.find(e => e.eventType === 'email_clicked')?._count || 0;
    const bouncedCount = eventCounts.find(e => e.eventType === 'email_bounced')?._count || 0;
    const deliveredCount = eventCounts.find(e => e.eventType === 'email_delivered')?._count || 0;

    const openRate = deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0;
    const clickRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;
    const bounceRate = deliveredCount > 0 ? (bouncedCount / (deliveredCount + bouncedCount)) * 100 : 0;

    const hotLeads = clusterCounts.find(c => c.cluster === 'HOT')?._count || 0;
    const warmLeads = clusterCounts.find(c => c.cluster === 'WARM')?._count || 0;
    const coldLeads = clusterCounts.find(c => c.cluster === 'COLD')?._count || 0;

    return NextResponse.json({
      period: { days, from: dateFrom.toISOString(), to: new Date().toISOString() },
      overview: {
        totalEvents,
        totalLeads: hotLeads + warmLeads + coldLeads,
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
        bounceRate: Math.round(bounceRate * 10) / 10,
      },
      clusters: {
        HOT: hotLeads,
        WARM: warmLeads,
        COLD: coldLeads,
        NEUTRAL: clusterCounts.find(c => c.cluster === 'NEUTRAL')?._count || 0,
      },
      funnelStages: stageCounts.reduce((acc, s) => {
        acc[s.funnelStage || 'UNKNOWN'] = s._count;
        return acc;
      }, {} as Record<string, number>),
      campaigns: campaignStats.map(c => ({
        name: c.campaignName,
        events: c._count,
      })),
      eventBreakdown: eventCounts.map(e => ({
        type: e.eventType,
        count: e._count,
      })),
      topLeads,
      recentEvents: recentEvents.map(e => ({
        id: e.id,
        type: e.eventType,
        email: e.email,
        leadName: e.lead?.name,
        leadCluster: e.lead?.cluster,
        campaignName: e.campaignName,
        scoreDelta: e.scoreDelta,
        createdAt: e.createdAt,
      })),
    });

  } catch (error) {
    console.error('❌ [FUNNEL ANALYTICS] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao carregar analytics' },
      { status: 500 }
    );
  }
}
