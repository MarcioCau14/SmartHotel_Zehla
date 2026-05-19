import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET() : void {
  try {
    const [totalLeads, hotLeads, byState, recentActivity] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { score: { gte: 90 } } }),
      prisma.lead.groupBy({
        by: ['state'],
        _count: true,
        orderBy: { _count: { state: 'desc' } }
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: { name: true, city: true, score: true, updatedAt: true }
      })
    ]);

    return NextResponse.json({
      total: totalLeads,
      hotLeads,
      byState: byState.map(s => ({ uf: s.state, count: s._count })),
      recent: recentActivity,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

