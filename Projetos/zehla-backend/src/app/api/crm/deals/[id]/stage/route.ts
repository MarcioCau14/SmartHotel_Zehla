import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _PATCH(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { stage } = body;

    if (!stage) {
      return NextResponse.json({ error: 'Stage is required' }, { status: 400 });
    }

    const deal = await prisma.crmDeal.findFirst({
      where: { id },
      include: { pipeline: { select: { id: true, stages: true } } },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const validStages = deal.pipeline.stages as Array<{ name: string; color: string }>;
    const stageNames = validStages.map((s) => s.name);
    if (!stageNames.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Valid stages: ${stageNames.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await prisma.crmDeal.update({
      where: { id },
      data: { stage },
      include: {
        contact: { select: { id: true, name: true } },
        pipeline: { select: { id: true, name: true, stages: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ deal: updated });
  } catch (error) {
    console.error('[CRM] PATCH deal stage error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const PATCH = withApiSecurity(_PATCH, { rateLimit: { limit: 60, windowSeconds: 60 } });
