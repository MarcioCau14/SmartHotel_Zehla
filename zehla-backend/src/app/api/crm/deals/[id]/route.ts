import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _PATCH(
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) {
  try {
  const { id } = await context!.params;
    const body = await req.json();
    const { title, value, stage, expectedCloseDate, probability, notes, contactId, ownerId } = body;

    const existing = await prisma.crmDeal.findFirst({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const deal = await prisma.crmDeal.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(value !== undefined && { value }),
        ...(stage !== undefined && { stage }),
        ...(expectedCloseDate !== undefined && { expectedCloseDate: new Date(expectedCloseDate) }),
        ...(probability !== undefined && { probability }),
        ...(notes !== undefined && { notes }),
        ...(contactId !== undefined && { contactId }),
        ...(ownerId !== undefined && { ownerId }),
      },
      include: {
        contact: { select: { id: true, name: true } },
        pipeline: { select: { id: true, name: true, stages: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ deal });
  } catch (error) {
    console.error('[CRM] PATCH deal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const PATCH = withApiSecurity(_PATCH, { rateLimit: { limit: 60, windowSeconds: 60 } });
