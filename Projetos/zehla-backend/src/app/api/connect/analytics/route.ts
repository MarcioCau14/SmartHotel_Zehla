import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      include: { connectProfile: true },
    });

    if (!property?.connectProfile) {
      return NextResponse.json(
        { error: 'Perfil Connect não encontrado' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - days);

    const analytics = await prisma.connectAnalytics.findMany({
      where: {
        profileId: property.connectProfile.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'desc' },
    });

    const totals = analytics.reduce(
      (acc, curr) => ({
        views: acc.views + curr.views,
        clicks: acc.clicks + curr.clicks,
      }),
      { views: 0, clicks: 0 }
    );

    const profile = property.connectProfile;

    return NextResponse.json({
      analytics,
      totals: {
        ...totals,
        ctr: totals.views > 0 ? (totals.clicks / totals.views) * 100 : 0,
      },
      profile: {
        totalViews: profile.totalViews,
        totalClicks: profile.totalClicks,
      },
    });
  } catch (error) {
    console.error('[API:CONNECT:ANALYTICS] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, {
  rateLimit: { limit: 60, windowSeconds: 60 },
});
