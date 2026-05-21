import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getTenantCostSummary, logBillingEvent } from '@/lib/finops-breaker';
import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      select: { id: true, plan: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const summary = await getTenantCostSummary(property.id, property.plan);

    const recentLogs = await prisma.billingLog.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      summary,
      recentLogs,
    });
  } catch (error) {
    console.error('[API:BILLING:USAGE] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function _POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      select: { id: true, plan: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const body = await req.json();
    const { type, units, metadata } = body;

    await logBillingEvent(property.id, type, units || 1, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API:BILLING:USAGE] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});

export const POST = withApiSecurity(_POST, {
  rateLimit: { limit: 100, windowSeconds: 60 },
});
