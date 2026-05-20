import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27' as any,
});

export class StripeService {
  /**
   * Cria um link de checkout para uma reserva
   */
  static async createCheckoutLink(params: {
    propertyId: string;
    reservationId: string;
    amount: number;
    description: string;
    guestEmail?: string;
  }) {
    const config = await prisma.stripeConfig.findUnique({
      where: { propertyId: params.propertyId }
    });

    if (!config?.stripeAccountId || !config.chargesEnabled) {
      throw new Error('A pousada não possui uma conta Stripe ativa conectada.');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Reserva: ${params.description}`,
            },
            unit_amount: Math.round(params.amount * 100), // Em centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
      metadata: {
        reservationId: params.reservationId,
        propertyId: params.propertyId
      },
    }, {
      stripeAccount: config.stripeAccountId, // Cobrança direta na conta da pousada (Connect)
    });

    return session.url;
  }

  /**
   * Gera o link para o onboarding do Stripe Connect
   */
  static async createConnectLink(propertyId: string) {
    const config = await prisma.stripeConfig.upsert({
      where: { propertyId },
      update: {},
      create: { propertyId }
    });

    let accountId = config.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        country: 'BR',
        email: undefined, // Opcional: pegar do tenant
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      
      await prisma.stripeConfig.update({
        where: { propertyId },
        data: { stripeAccountId: accountId }
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/settings/payments?refresh=true`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings/payments?success=true`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }
}
