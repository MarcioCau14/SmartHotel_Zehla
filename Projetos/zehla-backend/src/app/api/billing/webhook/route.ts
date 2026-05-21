import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        const property = await prisma.property.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (property) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;

          let newPlan = 'LITE';
          if (priceId === process.env.STRIPE_PRICE_PRO) newPlan = 'PRO';
          else if (priceId === process.env.STRIPE_PRICE_MAX) newPlan = 'MAX';

          await prisma.property.update({
            where: { id: property.id },
            data: {
              stripeSubscriptionId: subscriptionId,
              stripePriceId: priceId,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              plan: newPlan as any,
              isTrial: false,
            },
          });

          console.log(`[Stripe] Property ${property.id} upgraded to ${newPlan}`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const property = await prisma.property.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (property) {
          await prisma.invoice.create({
            data: {
              propertyId: property.id,
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
              status: 'PAID',
              totalAmount: invoice.amount_paid / 100,
              items: {
                create: {
                  type: 'PACKAGE_FEE',
                  description: `Subscription payment - ${invoice.lines.data[0]?.description || 'ZEHLA Plan'}`,
                  amount: invoice.amount_paid / 100,
                },
              },
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const property = await prisma.property.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (property) {
          await prisma.invoice.create({
            data: {
              propertyId: property.id,
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
              status: 'FAILED',
              totalAmount: invoice.amount_due / 100,
              items: {
                create: {
                  type: 'PACKAGE_FEE',
                  description: 'Subscription payment failed',
                  amount: invoice.amount_due / 100,
                },
              },
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const property = await prisma.property.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (property) {
          await prisma.property.update({
            where: { id: property.id },
            data: {
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const property = await prisma.property.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (property) {
          await prisma.property.update({
            where: { id: property.id },
            data: {
              stripeSubscriptionId: null,
              stripePriceId: null,
              currentPeriodEnd: null,
              plan: 'LITE',
              isTrial: false,
            },
          });
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
