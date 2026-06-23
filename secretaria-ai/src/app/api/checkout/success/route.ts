import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get('subscription_id');

    if (!subscriptionId) {
      return NextResponse.redirect(new URL('/?error=missing_subscription', request.url));
    }

    const subscription = await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'active',
        paymentStatus: 'approved',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    });

    const tenant = await db.tenant.update({
      where: { id: subscription.tenantId },
      data: {
        plan: subscription.planType as any,
        status: 'active',
        subscriptionAt: new Date()
      }
    });

    const propertyCount = await db.property.count({
      where: { tenantId: tenant.id }
    });

    if (propertyCount === 0) {
      await db.property.create({
        data: {
          tenantId: tenant.id,
          name: `${tenant.name} - Principal`,
          type: 'pousada'
        }
      });
    }

    return NextResponse.redirect(new URL('/dashboard?payment=success', request.url));
  } catch (error) {
    console.error('Payment success error:', error);
    return NextResponse.redirect(new URL('/?error=payment_failed', request.url));
  }
}