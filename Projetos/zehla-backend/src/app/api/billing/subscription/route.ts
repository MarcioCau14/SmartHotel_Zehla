import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { stripe, PLANS, createStripeCustomer, createSubscription, createBillingPortalSession } from '@/lib/stripe';
import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      select: {
        id: true,
        plan: true,
        isTrial: true,
        trialEndsAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      property: {
        id: property.id,
        plan: property.plan,
        isTrial: property.isTrial,
        trialEndsAt: property.trialEndsAt,
        stripeCustomerId: property.stripeCustomerId,
        stripeSubscriptionId: property.stripeSubscriptionId,
        currentPeriodEnd: property.currentPeriodEnd,
        cancelAtPeriodEnd: property.cancelAtPeriodEnd,
      },
      plans: Object.entries(PLANS).map(([key, plan]) => ({
        key,
        ...plan,
      })),
    });
  } catch (error) {
    console.error('[API:BILLING:SUBSCRIPTION] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function _POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { action, planKey } = body;

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    if (action === 'create_checkout') {
      const plan = PLANS[planKey as keyof typeof PLANS];
      if (!plan) {
        return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
      }

      let customerId = property.stripeCustomerId;

      if (!customerId) {
        const customer = await createStripeCustomer(
          session.user.email || '',
          session.user.name || property.name,
          { propertyId: property.id }
        );
        customerId = customer.id;

        await prisma.property.update({
          where: { id: property.id },
          data: { stripeCustomerId: customerId },
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/configuracoes?tab=billing&success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/configuracoes?tab=billing&canceled=true`,
        metadata: { propertyId: property.id },
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    if (action === 'create_portal') {
      if (!property.stripeCustomerId) {
        return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 404 });
      }

      const portalSession = await createBillingPortalSession(
        property.stripeCustomerId,
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/configuracoes?tab=billing`
      );

      return NextResponse.json({ url: portalSession.url });
    }

    if (action === 'cancel') {
      if (!property.stripeSubscriptionId) {
        return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 404 });
      }

      await prisma.property.update({
        where: { id: property.id },
        data: { cancelAtPeriodEnd: true },
      });

      return NextResponse.json({ success: true, message: 'Assinatura será cancelada no final do período' });
    }

    if (action === 'reactivate') {
      if (!property.stripeSubscriptionId) {
        return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 404 });
      }

      await prisma.property.update({
        where: { id: property.id },
        data: { cancelAtPeriodEnd: false },
      });

      return NextResponse.json({ success: true, message: 'Assinatura reativada' });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('[API:BILLING:SUBSCRIPTION] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});

export const POST = withApiSecurity(_POST, {
  rateLimit: { limit: 10, windowSeconds: 60 },
});
