import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenant_id');

    if (!tenantId) {
      return NextResponse.redirect(new URL('/?error=missing_tenant', request.url));
    }

    // Update tenant to active
    const tenant = await db.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'active',
        subscriptionAt: new Date()
      }
    });

    // Create default property for tenant if none exists
    // The previous code checked `!tenant.property` but `tenant` alone doesn't fetch relations by default
    const propertyCount = await db.property.count({
      where: { tenantId: tenant.id }
    });

    if (propertyCount === 0) {
      await db.property.create({
        data: {
          tenantId: tenant.id,
          name: `${tenant.name} - Principal`,
          type: 'pousada',
        }
      });
    }

    // Redirect to dashboard with success message
    return NextResponse.redirect(new URL('/dashboard?payment=success', request.url));

  } catch (error) {
    console.error('Payment success error:', error);
    return NextResponse.redirect(new URL('/?error=payment_failed', request.url));
  }
}