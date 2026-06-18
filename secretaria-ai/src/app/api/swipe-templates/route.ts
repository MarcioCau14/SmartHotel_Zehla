import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const templates = await db.swipeTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      templates.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('[SWIPE_TEMPLATES_GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar templates' },
      { status: 500 }
    );
  }
}