import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

export async function GET() {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ name: 'Minha Pousada' });
    }

    const property = await db.property.findFirst({
      where: { tenantId }
    });

    return NextResponse.json({
      name: property?.name || 'Minha Pousada'
    });
  } catch (error) {
    console.error('[property-name GET] Error:', error);
    return NextResponse.json({ name: 'Minha Pousada' });
  }
}
