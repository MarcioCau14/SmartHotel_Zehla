import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTenantId } from '@/lib/security/tenant-context';
import { withSecurity } from '@/lib/security/api-shield';

async function getHandler(request: NextRequest, _ctx: any) {
  try {
    const tenantId = await requireTenantId();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const where: Record<string, unknown> = { tenantId };
    if (status) {
      where.status = status;
    }

    const campaigns = await db.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      campaigns.map((c) => ({
        ...c,
        scheduledAt: c.scheduledAt?.toISOString() ?? null,
        startedAt: c.startedAt?.toISOString() ?? null,
        completedAt: c.completedAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[CAMPAIGNS_GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar campanhas' },
      { status: 500 }
    );
  }
}

async function postHandler(request: NextRequest, _ctx: any) {
  try {
    const tenantId = await requireTenantId();
    const body = await request.json();
    const {
      name,
      type,
      targetAudience,
      messageTemplate,
      scheduledAt,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'O campo "name" é obrigatório' },
        { status: 400 }
      );
    }

    const campaign = await db.campaign.create({
      data: {
        tenantId,
        name,
        type: type || 'whatsapp',
        status: 'draft',
        targetAudience: targetAudience || 'all',
        messageTemplate: messageTemplate || '',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return NextResponse.json(
      {
        ...campaign,
        scheduledAt: campaign.scheduledAt?.toISOString() ?? null,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[CAMPAIGNS_POST]', error);
    return NextResponse.json(
      { error: 'Erro ao criar campanha' },
      { status: 500 }
    );
  }
}

export const GET = withSecurity(getHandler, { routeLabel: 'campaigns' });
export const POST = withSecurity(postHandler, { routeLabel: 'campaigns' });