import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-06-20',
  typescript: true,
});

export const PLANS = {
  LITE: {
    name: 'Lite',
    price: 248,
    stripePriceId: process.env.STRIPE_PRICE_LITE || 'price_lite_test',
    features: ['Até 8 quartos', 'WhatsApp Bot básico', 'Connect page', 'Dashboard completo'],
    limits: { rooms: 8, aiMessages: 100, connectViews: 1000 },
  },
  PRO: {
    name: 'Pro',
    price: 448,
    stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_pro_test',
    features: ['Até 20 quartos', 'WhatsApp Bot IA', 'Connect page + temas', 'Revenue Management', 'CRM básico'],
    limits: { rooms: 20, aiMessages: 1000, connectViews: 10000 },
  },
  MAX: {
    name: 'Max',
    price: 798,
    stripePriceId: process.env.STRIPE_PRICE_MAX || 'price_max_test',
    features: ['Quartos ilimitados', 'WhatsApp Bot IA avançado', 'Connect page + afiliados', 'Revenue Management + IA', 'CRM completo', 'Channel Manager'],
    limits: { rooms: Infinity, aiMessages: Infinity, connectViews: Infinity },
  },
};

export type PlanName = keyof typeof PLANS;

export async function createStripeCustomer(email: string, name: string, metadata?: Record<string, string>) {
  return stripe.customers.create({
    email,
    name,
    metadata: metadata || {},
  });
}

export async function createSubscription(customerId: string, priceId: string) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function reactivateSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function updateSubscriptionPlan(subscriptionId: string, newPriceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentItemId = subscription.items.data[0].id;

  return stripe.subscriptions.update(subscriptionId, {
    items: [{ id: currentItemId, price: newPriceId }],
    proration_behavior: 'create_prorations',
  });
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
