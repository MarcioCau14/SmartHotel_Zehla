/**
 * ZEHLA DDC — Auth & Tenant Resolution Utility
 * 
 * Resolves tenantId from NextAuth session for DDC API routes.
 * On Vercel serverless (no SQLite), returns session's tenantId directly.
 * In development (BYPASS_MIDDLEWARE_AUTH=true), falls back to the first tenant.
 * In production, returns null if no session — callers must handle this.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, isDatabaseAvailable } from '@/lib/db';

/** Check if we're running on Vercel (serverless — no persistent SQLite) */
function isVercelServerless(): boolean {
  return !!(process.env.VERCEL || process.env.VERCEL_ENV);
}

export async function resolveTenantId(): Promise<string | null> {
  // On Vercel serverless, skip DB entirely — return from session
  if (isVercelServerless()) {
    try {
      const session = await getServerSession(authOptions);
      return session?.user?.tenantId ?? null;
    } catch {
      return null;
    }
  }

  try {
    // Dev mode bypass: use first tenant from DB (if available)
    if (process.env.BYPASS_MIDDLEWARE_AUTH === 'true') {
      const dbOk = await isDatabaseAvailable();
      if (dbOk) {
        const firstTenant = await db.tenant.findFirst({ select: { id: true } });
        return firstTenant?.id ?? null;
      }
      return 'demo-tenant-id';
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return null;
    }

    return session.user.tenantId;
  } catch {
    // Fallback: try to get tenantId from session without DB
    try {
      const session = await getServerSession(authOptions);
      return session?.user?.tenantId ?? null;
    } catch {
      return null;
    }
  }
}

/**
 * Strict version — throws if no tenant resolved.
 */
export async function requireDDCTenantId(): Promise<string> {
  const tenantId = await resolveTenantId();
  if (!tenantId) {
    throw new Error('DDC_AUTH_REQUIRED: No tenant context found.');
  }
  return tenantId;
}