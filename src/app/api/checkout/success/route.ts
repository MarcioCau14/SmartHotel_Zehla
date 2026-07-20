import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get('subscription_id');
    const sig = searchParams.get('sig');

    if (!subscriptionId) {
      return NextResponse.redirect(new URL('/?error=missing_subscription', request.url));
    }

    if (!sig) {
      return NextResponse.redirect(new URL('/?error=invalid_signature', request.url));
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
    }

    const secret = process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production';
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(subscriptionId)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return NextResponse.redirect(new URL('/?error=invalid_signature', request.url));
    }

    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return NextResponse.redirect(new URL('/?error=subscription_not_found', request.url));
    }

    if (subscription.tenantId !== session.user.tenantId) {
      return NextResponse.redirect(new URL('/?error=forbidden', request.url));
    }

    await db.subscription.update({
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
          slug: `${tenant.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}-principal`,
          type: 'pousada'
        }
      });
    }

    return NextResponse.redirect(new URL('/ddc?payment=success', request.url));
  } catch (error) {
    console.error('Payment success error:', error);
    return NextResponse.redirect(new URL('/?error=payment_failed', request.url));
  }
}