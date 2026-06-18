import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await db.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[LEAD_GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar lead' },
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

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    const { status, validationScore, decisor, cargo, whatsapp, setor, porte, hook, socialMedia } = body;

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (validationScore !== undefined) updateData.validationScore = validationScore;
    if (decisor !== undefined) updateData.decisor = decisor;
    if (cargo !== undefined) updateData.cargo = cargo;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (setor !== undefined) updateData.setor = setor;
    if (porte !== undefined) updateData.porte = porte;
    if (hook !== undefined) updateData.hook = hook;
    if (socialMedia !== undefined) updateData.socialMedia = JSON.stringify(socialMedia);

    const updated = await db.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[LEAD_PUT]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar lead' },
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

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    await db.lead.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('[LEAD_DELETE]', error);
    return NextResponse.json(
      { error: 'Erro ao deletar lead' },
      { status: 500 }
    );
  }
}