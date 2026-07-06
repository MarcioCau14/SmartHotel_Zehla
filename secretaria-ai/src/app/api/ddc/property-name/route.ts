import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';
import { getEffectivePlan } from '@/lib/plan-resolver';

export async function GET() {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ name: 'Minha Pousada', plan: 'trial', tenantId: '' });
    }

    const property = await db.property.findFirst({
      where: { tenantId }
    });

    const effectivePlan = await getEffectivePlan(tenantId);

    return NextResponse.json({
      name: property?.name || 'Minha Pousada',
      plan: effectivePlan,
      tenantId
    });
  } catch (error) {
    console.error('[property-name GET] Error:', error);
    return NextResponse.json({ name: 'Minha Pousada', plan: 'trial', tenantId: '' });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
    }

    const updatedProperty = await db.property.upsert({
      where: { tenantId },
      update: { name: name.trim() },
      create: { tenantId, name: name.trim() }
    });

    return NextResponse.json({ name: updatedProperty.name });
  } catch (error) {
    console.error('[property-name POST] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
