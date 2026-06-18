import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const where: Record<string, unknown> = {};
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
    console.error('[CAMPAIGNS_GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar campanhas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
    console.error('[CAMPAIGNS_POST]', error);
    return NextResponse.json(
      { error: 'Erro ao criar campanha' },
      { status: 500 }
    );
  }
}