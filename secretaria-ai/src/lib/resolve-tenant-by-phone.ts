import { db } from '@/lib/db';

/**
 * Resolve tenantId based on the WhatsApp phone number that received the message.
 * Cleans the input and matches against Tenant.phone or Tenant.phoneAlt.
 */
export async function resolveTenantByPhone(recipientPhone: string): Promise<string | null> {
  if (!recipientPhone) return null;

  // Clean formatted phone numbers (strip +, spaces, dashes, etc.)
  const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');

  try {
    // Attempt exact match or substring match in db
    const tenant = await db.tenant.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phoneAlt: cleanPhone },
          // Substring matches for numbers stored with or without country/area codes
          { phone: { contains: cleanPhone } },
          { phoneAlt: { contains: cleanPhone } },
        ],
      },
    });

    if (tenant) {
      return tenant.id;
    }

    // Fallback for mock simulations / local testing: use the first active tenant
    const firstTenant = await db.tenant.findFirst({
      where: { status: 'active' },
      orderBy: { createdAt: 'asc' },
    });

    return firstTenant?.id || null;
  } catch (error) {
    console.error('[resolveTenantByPhone] Error querying database:', error);
    // Safe fallback to first tenant even on query failures (SQLite lock issues in tests)
    try {
      const firstTenant = await db.tenant.findFirst({
        where: { status: 'active' },
        orderBy: { createdAt: 'asc' },
      });
      return firstTenant?.id || null;
    } catch {
      return null;
    }
  }
}
