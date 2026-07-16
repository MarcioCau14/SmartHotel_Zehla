import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';
import { getEffectivePlan } from '@/lib/plan-resolver';

export async function GET() {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ name: 'Pousada Paraíso', plan: 'pro', tenantId: 'demo-tenant-id' });
    }

    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return NextResponse.json({ name: 'Pousada Paraíso', plan: 'pro', tenantId });
    }

    const property = await db.property.findFirst({
      where: { tenantId }
    });

    const effectivePlan = await getEffectivePlan(tenantId);

    return NextResponse.json({
      name: property?.name || 'Pousada Paraíso',
      plan: effectivePlan || 'pro',
      tenantId
    });
  } catch (error) {
    console.error('[property-name GET] Error:', error);
    return NextResponse.json({ name: 'Pousada Paraíso', plan: 'pro', tenantId: 'demo-tenant-id' });
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
      create: { tenantId, name: name.trim(), slug: name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') }
    });

    return NextResponse.json({ name: updatedProperty.name });
  } catch (error) {
    console.error('[property-name POST] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
