import { db } from '@/lib/db';
import type { PlanTier } from '@/lib/plan-features';
import { migratePlanLegacy } from '@/lib/plan-features';

/**
 * Resolves the active plan for a tenant, prioritizing active Subscriptions
 * and falling back to the Tenant plan column if no active subscription exists.
 *
 * UNIFIED TAXONOMY: Sempre retorna 'gratuito' | 'lite' | 'pro' | 'max' | 'parceiro'
 * Valores legados (trial, starter, business, professional) são migrados automaticamente.
 */
export async function getEffectivePlan(tenantId: string): Promise<PlanTier> {
  try {
    // 1. Verify active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        tenantId,
        status: 'active',
      },
    });

    if (subscription) {
      return migratePlanLegacy(subscription.planType);
    }

    // 2. Fallback to Tenant plan
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });

    if (!tenant) return 'gratuito';

    return migratePlanLegacy(tenant.plan);
  } catch (error) {
    console.error('[getEffectivePlan] Error resolving plan:', error);
    return 'gratuito';
  }
}
