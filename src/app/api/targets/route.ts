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
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[TARGETS_GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar targets' },
      { status: 500 }
    );
  }
}

async function postHandler(request: NextRequest, _ctx: any) {
  try {
    const tenantId = await requireTenantId();
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
        tenantId,
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
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[TARGETS_POST]', error);
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Já existe um target com este domínio neste tenant' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao criar target' },
      { status: 500 }
    );
  }
}

export const GET = withSecurity(getHandler, { routeLabel: 'targets' });
export const POST = withSecurity(postHandler, { routeLabel: 'targets' });