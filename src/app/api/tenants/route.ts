import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurity } from '@/lib/security/api-shield';

async function getHandler(_request: NextRequest, _ctx: any) {
  try {
    const tenants = await db.tenant.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ success: true, tenants });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

export const GET = withSecurity(getHandler, { routeLabel: 'tenants' });