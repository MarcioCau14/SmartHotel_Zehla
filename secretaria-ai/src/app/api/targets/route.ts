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

    const targets = await db.target.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(
      targets.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('[TARGETS_GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar targets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, domain, website, city, state, priority } = body;

    if (!name || !domain) {
      return NextResponse.json(
        { error: 'Os campos "name" e "domain" são obrigatórios' },
        { status: 400 }
      );
    }

    const target = await db.target.create({
      data: {
        name,
        domain,
        website: website || null,
        city: city || '',
        state: state || '',
        priority: priority ?? 5,
        status: 'active',
      },
    });

    return NextResponse.json(
      {
        ...target,
        createdAt: target.createdAt.toISOString(),
        updatedAt: target.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[TARGETS_POST]', error);
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Já existe um target com este domínio' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao criar target' },
      { status: 500 }
    );
  }
}