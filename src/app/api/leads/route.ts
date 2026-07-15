import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTenantId } from '@/lib/security/tenant-context';
import { withSecurity } from '@/lib/security/api-shield';

async function getHandler(request: NextRequest, _ctx: any) {
  try {
    const tenantId = await requireTenantId();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || undefined;
    const minScore = searchParams.get('minScore')
      ? parseFloat(searchParams.get('minScore')!)
      : undefined;
    const search = searchParams.get('search') || undefined;
    const company = searchParams.get('company') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };

    if (status) {
      where.status = status;
    }

    if (minScore !== undefined) {
      where.validationScore = { gte: minScore };
    }

    if (search) {
      where.OR = [
        { empresa: { contains: search } },
        { decisor: { contains: search } },
        { email: { contains: search } },
        { whatsapp: { contains: search } },
      ];
    }

    if (company) {
      where.empresa = { contains: company };
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.lead.count({ where }),
    ]);

    return NextResponse.json({
      data: leads.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[LEADS_GET]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar leads' },
      { status: 500 }
    );
  }
}

async function postHandler(request: NextRequest, _ctx: any) {
  try {
    const tenantId = await requireTenantId();
    const body = await request.json();

    const {
      empresa,
      decisor,
      cargo,
      email,
      whatsapp,
      setor,
      socialMedia,
      porte,
      hook,
      validationScore,
    } = body;

    if (!empresa || !email) {
      return NextResponse.json(
        { error: 'Os campos "empresa" e "email" são obrigatórios' },
        { status: 400 }
      );
    }

    const lead = await db.lead.create({
      data: {
        tenantId,
        empresa,
        decisor: decisor || '',
        cargo: cargo || '',
        email,
        whatsapp: whatsapp || '',
        setor: setor || 'hospitalidade',
        socialMedia: socialMedia ? JSON.stringify(socialMedia) : '{}',
        porte: porte || 'pequeno',
        hook: hook || '',
        validationScore: validationScore ?? 0,
        status: 'pending',
      },
    });

    return NextResponse.json(
      {
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[LEADS_POST]', error);
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Já existe um lead com este email neste tenant' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao criar lead' },
      { status: 500 }
    );
  }
}

export const GET = withSecurity(getHandler, { routeLabel: 'leads' });
export const POST = withSecurity(postHandler, { routeLabel: 'leads' });