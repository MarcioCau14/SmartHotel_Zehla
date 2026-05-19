import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

// src/app/api/swipes/stats/route.ts

async function _GET(req: NextRequest) : void {
  try {
    const stats = await prisma.swipeTemplate.findMany({
      select: { id: true, title: true, timesUsed: true, conversions: true, convRate: true, channel: true },
      orderBy: { convRate: 'desc' },
      take: 10
    });
    return NextResponse.json(stats);
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

