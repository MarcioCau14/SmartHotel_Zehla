import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await db.campaign.findUnique({ where: { id } });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...campaign,
      scheduledAt: campaign.scheduledAt?.toISOString() ?? null,
      startedAt: campaign.startedAt?.toISOString() ?? null,
      completedAt: campaign.completedAt?.toISOString() ?? null,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[CAMPAIGN_GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar campanha' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    const { status, name, type, targetAudience, messageTemplate } = body;
    const now = new Date();

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (messageTemplate !== undefined) updateData.messageTemplate = messageTemplate;

    if (status !== undefined) {
      updateData.status = status;

      if (status === 'active' && !existing.startedAt) {
        updateData.startedAt = now;
      }

      if (status === 'completed') {
        updateData.completedAt = now;
      }
    }

    const updated = await db.campaign.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      scheduledAt: updated.scheduledAt?.toISOString() ?? null,
      startedAt: updated.startedAt?.toISOString() ?? null,
      completedAt: updated.completedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[CAMPAIGN_PUT]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar campanha' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    await db.campaign.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('[CAMPAIGN_DELETE]', error);
    return NextResponse.json(
      { error: 'Erro ao deletar campanha' },
      { status: 500 }
    );
  }
}