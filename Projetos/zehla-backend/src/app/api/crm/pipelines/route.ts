import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET() {
  try {
  const pipelines = await prisma.crmPipeline.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      include: {
        _count: { select: { deals: true } },
      },
    });

    return NextResponse.json({ pipelines });
  } catch (error) {
    console.error('[CRM] GET pipelines error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

async function _POST(req: NextRequest) {
  try {
  const body = await req.json();
    const { name, stages, isDefault } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!Array.isArray(stages) || stages.length === 0) {
      return NextResponse.json({ error: 'Stages must be a non-empty array' }, { status: 400 });
    }

    if (isDefault) {
      await prisma.crmPipeline.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const pipeline = await prisma.crmPipeline.create({
      data: {
        name,
        stages,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ pipeline }, { status: 201 });
  } catch (error) {
    console.error('[CRM] POST pipeline error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } });
