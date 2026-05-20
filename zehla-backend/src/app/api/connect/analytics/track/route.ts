import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(req: NextRequest) {
  try {
  const body = await req.json();
    const { slug, type, linkId } = body;

    if (!slug) {
      return NextResponse.json(
        { error: 'slug é obrigatório' },
        { status: 400 }
      );
    }

    const profile = await prisma.connectProfile.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const analytics = await prisma.connectAnalytics.upsert({
      where: {
        profileId_date: { profileId: profile.id, date: today },
      },
      create: {
        profileId: profile.id,
        date: today,
        views: type === 'view' ? 1 : 0,
        clicks: type === 'click' ? 1 : 0,
        ctr: 0,
      },
      update: {
        views: type === 'view' ? { increment: 1 } : undefined,
        clicks: type === 'click' ? { increment: 1 } : undefined,
      },
    });

    if (type === 'click' && linkId) {
      await prisma.connectLink.update({
        where: { id: linkId },
        data: { clickCount: { increment: 1 } },
      });

      await prisma.connectProfile.update({
        where: { id: profile.id },
        data: { totalClicks: { increment: 1 } },
      });
    }

    if (analytics.views > 0 && analytics.clicks > 0) {
      await prisma.connectAnalytics.update({
        where: { id: analytics.id },
        data: {
          ctr: (analytics.clicks / analytics.views) * 100,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API:CONNECT:ANALYTICS:TRACK] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const POST = withApiSecurity(_POST, {
  rateLimit: { limit: 500, windowSeconds: 60 },
  csrf: false,
});
