import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const target = await db.target.findUnique({ where: { id } });

    if (!target) {
      return NextResponse.json(
        { error: 'Target não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...target,
      createdAt: target.createdAt.toISOString(),
      updatedAt: target.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[TARGET_GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar target' },
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

    const existing = await db.target.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Target não encontrado' },
        { status: 404 }
      );
    }

    const { status, priority, name, website, city, state } = body;

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (name !== undefined) updateData.name = name;
    if (website !== undefined) updateData.website = website;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;

    const updated = await db.target.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[TARGET_PUT]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar target' },
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

    const existing = await db.target.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Target não encontrado' },
        { status: 404 }
      );
    }

    await db.target.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('[TARGET_DELETE]', error);
    return NextResponse.json(
      { error: 'Erro ao deletar target' },
      { status: 500 }
    );
  }
}