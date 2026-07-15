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

    // ZDR: No silent fallback in production — return null to force rejection
    if (process.env.NODE_ENV === 'production') {
      console.warn('[resolveTenantByPhone] No tenant found for phone in production — rejecting.');
      return null;
    }

    // Dev/CI only: fallback to first tenant for mock simulations
    const firstTenant = await db.tenant.findFirst({
      where: { status: 'active' },
      orderBy: { createdAt: 'asc' },
    });

    return firstTenant?.id || null;
  } catch (error) {
    console.error('[resolveTenantByPhone] Error querying database:', error);
    return null; // Never fall back on error
  }
}
