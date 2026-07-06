import { db } from '@/lib/db';

/**
 * Resolves the active plan for a tenant, prioritizing active Subscriptions
 * and falling back to the Tenant plan column if no active subscription exists.
 * Unifies the distinct plan systems:
 * - Subscription.planType: gratuito | lite | pro | max
 * - Tenant.plan: trial | starter | pro | business
 *
 * Returns normalized values: 'trial' | 'lite' | 'pro' | 'max'
 */
export async function getEffectivePlan(tenantId: string): Promise<'trial' | 'lite' | 'pro' | 'max'> {
  try {
    // 1. Verify active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        tenantId,
        status: 'active',
      },
    });

    if (subscription) {
      const type = subscription.planType.toLowerCase();
      if (type === 'gratuito') return 'trial';
      return type as 'trial' | 'lite' | 'pro' | 'max';
    }

    // 2. Fallback to Tenant plan
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });

    if (!tenant) return 'trial';

    const plan = tenant.plan.toLowerCase();
    if (plan === 'starter' || plan === 'gratuito') return 'trial';
    if (plan === 'business') return 'max';
    return plan as 'trial' | 'lite' | 'pro' | 'max';
  } catch (error) {
    console.error('[getEffectivePlan] Error resolving plan:', error);
    return 'trial';
  }
}
