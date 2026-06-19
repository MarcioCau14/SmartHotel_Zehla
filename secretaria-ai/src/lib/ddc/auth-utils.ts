/**
 * ZEHLA DDC — Auth & Tenant Resolution Utility
 * 
 * Safely resolves tenantId from Clerk session.
 * Falls back to 'client-001' (Pousada Serenity) in dev/offline mode.
 */

const FALLBACK_TENANT_ID = 'client-001';

export async function resolveTenantId(): Promise<string> {
  try {
    // Dynamic import to avoid crash when Clerk is not configured
    const { auth } = await import('@clerk/nextjs/server');
    
    const session = await auth();
    if (!session?.userId) {
      return FALLBACK_TENANT_ID;
    }

    const { orgId } = session;

    // 1. Tenta buscar por clerkOrgId no banco se houver orgId na sessão
    if (orgId) {
      const tenant = await (await import('@/lib/db')).db.tenant.findUnique({
        where: { clerkOrgId: orgId }
      });
      if (tenant) return tenant.id;
    }

    // 2. Se não encontrou por orgId, tenta buscar pelo email do usuário logado no Clerk
    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      const client = await clerkClient();
      const user = await client.users.getUser(session.userId);
      const email = user.emailAddresses[0]?.emailAddress;
      
      if (email) {
        const tenant = await (await import('@/lib/db')).db.tenant.findFirst({
          where: { email }
        });
        if (tenant) return tenant.id;
      }
    } catch (e) {
      // Falha silenciosa no Clerk Client
    }

    // 3. Fallback de segurança para tenant sem clerkOrgId (primeiro tenant ativo)
    const firstTenant = await (await import('@/lib/db')).db.tenant.findFirst({
      where: { clerkOrgId: null }
    });
    if (firstTenant) return firstTenant.id;

    return FALLBACK_TENANT_ID;
  } catch (error) {
    // Clerk not available or misconfigured — dev mode fallback
    return FALLBACK_TENANT_ID;
  }
}
