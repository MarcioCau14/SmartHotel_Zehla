/**
 * ZEHLA DDC — Auth & Tenant Resolution Utility
 * 
 * Safely resolves tenantId from Clerk session.
 * Falls back to 'client-001' (Pousada Serenity) in dev/offline mode.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const FALLBACK_TENANT_ID = 'client-001';

export async function resolveTenantId(): Promise<string> {
  try {
    if (process.env.BYPASS_MIDDLEWARE_AUTH === 'true') {
      const firstTenant = await db.tenant.findFirst();
      if (firstTenant) {
        return firstTenant.id;
      }
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return FALLBACK_TENANT_ID;
    }

    const tenantId = session.user.tenantId;
    if (tenantId) {
      return tenantId;
    }

    return FALLBACK_TENANT_ID;
  } catch (error) {
    return FALLBACK_TENANT_ID;
  }
}
