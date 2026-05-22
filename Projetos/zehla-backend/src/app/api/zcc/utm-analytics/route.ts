import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const properties = await prisma.property.findMany({
      where: {
        createdAt: { gte: since },
        utmCampaign: { not: null },
      },
      select: {
        id: true,
        name: true,
        plan: true,
        isTrial: true,
        trialEndsAt: true,
        stripeSubscriptionId: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmTerm: true,
        utmContent: true,
        refSource: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const campaignMetrics: Record<string, {
      campaign: string;
      source: string;
      totalLeads: number;
      trialStarted: number;
      convertedToPaid: number;
      conversionRate: number;
      activeTrials: number;
      expiredTrials: number;
      plans: Record<string, number>;
    }> = {};

    const now = new Date();

    for (const prop of properties) {
      const campaign = prop.utmCampaign || 'unknown';
      const key = `${campaign}::${prop.utmSource || 'direct'}`;

      if (!campaignMetrics[key]) {
        campaignMetrics[key] = {
          campaign,
          source: prop.utmSource || 'direct',
          totalLeads: 0,
          trialStarted: 0,
          convertedToPaid: 0,
          conversionRate: 0,
          activeTrials: 0,
          expiredTrials: 0,
          plans: {},
        };
      }

      const m = campaignMetrics[key];
      m.totalLeads++;

      if (prop.isTrial) {
        m.trialStarted++;
        if (prop.trialEndsAt && prop.trialEndsAt > now) {
          m.activeTrials++;
        } else {
          m.expiredTrials++;
        }
      }

      if (prop.stripeSubscriptionId) {
        m.convertedToPaid++;
      }

      m.plans[prop.plan] = (m.plans[prop.plan] || 0) + 1;
    }

    const campaigns = Object.values(campaignMetrics).map(m => ({
      ...m,
      conversionRate: m.totalLeads > 0 ? Math.round((m.convertedToPaid / m.totalLeads) * 100) : 0,
    }));

    const sourceMetrics: Record<string, number> = {};
    for (const prop of properties) {
      const source = prop.utmSource || 'direct';
      sourceMetrics[source] = (sourceMetrics[source] || 0) + 1;
    }

    const topCampaigns = campaigns
      .filter(c => c.totalLeads > 0)
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 10);

    return NextResponse.json({
      overview: {
        totalAttributed: properties.length,
        uniqueCampaigns: campaigns.length,
        uniqueSources: Object.keys(sourceMetrics).length,
        overallConversionRate: properties.length > 0
          ? Math.round((properties.filter(p => p.stripeSubscriptionId).length / properties.length) * 100)
          : 0,
      },
      topCampaigns,
      sourceBreakdown: sourceMetrics,
      allCampaigns: campaigns,
    });
  } catch (error) {
    console.error('[UTM-ANALYTICS] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
