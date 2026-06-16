import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage');
    const pipelineId = searchParams.get('pipelineId');
    const contactId = searchParams.get('contactId');
    const ownerId = searchParams.get('ownerId');
    const grouped = searchParams.get('grouped') === 'true';

    const where: any = {};

    if (stage) where.stage = stage;
    if (pipelineId) where.pipelineId = pipelineId;
    if (contactId) where.contactId = contactId;
    if (ownerId) where.ownerId = ownerId;

    const deals = await prisma.crmDeal.findMany({
      where,
      orderBy: [{ stage: 'asc' }, { createdAt: 'desc' }],
      include: {
        contact: {
          select: { id: true, name: true, email: true, phone: true, whatsapp: true },
        },
        pipeline: { select: { id: true, name: true, stages: true } },
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
    });

    if (grouped) {
      const stagesList: string[] = [];
      const stageColors: Record<string, string> = {};

      if (pipelineId && deals.length > 0) {
        const pipeline = await prisma.crmPipeline.findUnique({
          where: { id: pipelineId },
          select: { stages: true },
        });
        if (pipeline) {
          const parsed = pipeline.stages as Array<{ name: string; color: string }>;
          parsed.forEach((s) => {
            stagesList.push(s.name);
            stageColors[s.name] = s.color;
          });
        }
      } else {
        const uniqueStages = [...new Set(deals.map((d) => d.stage))];
        stagesList.push(...uniqueStages);
      }

      const groupedDeals: Record<string, { deals: typeof deals; color?: string }> = {};
      for (const s of stagesList) {
        groupedDeals[s] = {
          deals: deals.filter((d) => d.stage === s),
          color: stageColors[s],
        };
      }

      return NextResponse.json({ grouped: groupedDeals, stages: stagesList });
    }

    return NextResponse.json({ deals });
  } catch (error) {
    console.error('[CRM] GET deals error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

async function _POST(req: NextRequest) {
  try {
  const body = await req.json();
    const { title, value, stage, pipelineId, contactId, ownerId, expectedCloseDate, probability, notes } = body;

    if (!title || !pipelineId) {
      return NextResponse.json({ error: 'Title and pipelineId are required' }, { status: 400 });
    }

    const pipeline = await prisma.crmPipeline.findFirst({
      where: { id: pipelineId },
    });

    if (!pipeline) {
      return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
    }

    if (contactId) {
      const contact = await prisma.crmContact.findFirst({
        where: { id: contactId, deletedAt: null },
      });
      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
    }

    const dealStage = stage || ((pipeline.stages as Array<{ name: string; color: string }>)[0]?.name || '');

    const deal = await prisma.crmDeal.create({
      data: {
        title,
        value: value || 0,
        stage: dealStage,
        pipelineId,
        contactId,
        ownerId,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        probability: probability || 0,
        notes,
        propertyId: pipeline.propertyId,
      },
      include: {
        contact: { select: { id: true, name: true } },
        pipeline: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    console.error('[CRM] POST deal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withApiSecurity(_POST, { rateLimit: { limit: 50, windowSeconds: 60 } });
