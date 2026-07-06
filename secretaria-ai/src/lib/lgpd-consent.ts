import { db } from '@/lib/db';

interface ConsentParams {
  tenantId: string;
  guestId: string;
  channel?: string;
  ip?: string;
  userAgent?: string;
  evidence?: string;
}

/**
 * Registers an active marketing Opt-In for a guest.
 * Updates the Guest model and logs the consent evidence in ConsentLog.
 */
export async function registerOptIn(params: ConsentParams): Promise<void> {
  const { tenantId, guestId, channel = 'whatsapp', ip, userAgent, evidence = '{}' } = params;
  const now = new Date();

  await db.$transaction([
    db.guest.update({
      where: { id: guestId },
      data: {
        optInAt: now,
        optInMethod: channel,
        optOutAt: null, // Clear any previous opt-out
      },
    }),
    db.consentLog.create({
      data: {
        tenantId,
        guestId,
        type: 'opt_in',
        channel,
        ip,
        userAgent,
        evidence,
      },
    }),
  ]);
}

/**
 * Registers a marketing Opt-Out (revocation) for a guest.
 * Updates the Guest model and logs the revocation in ConsentLog.
 */
export async function registerOptOut(params: ConsentParams): Promise<void> {
  const { tenantId, guestId, channel = 'whatsapp', ip, userAgent, evidence = '{}' } = params;
  const now = new Date();

  await db.$transaction([
    db.guest.update({
      where: { id: guestId },
      data: {
        optOutAt: now,
      },
    }),
    db.consentLog.create({
      data: {
        tenantId,
        guestId,
        type: 'opt_out',
        channel,
        ip,
        userAgent,
        evidence,
      },
    }),
  ]);
}

/**
 * Checks if a guest has an active marketing consent under LGPD.
 * Active consent requires optInAt to be set and optOutAt to be null.
 */
export async function canSendMarketing(tenantId: string, guestId: string): Promise<boolean> {
  try {
    const guest = await db.guest.findFirst({
      where: {
        id: guestId,
        tenantId,
      },
      select: {
        optInAt: true,
        optOutAt: true,
      },
    });

    if (!guest) return false;
    return guest.optInAt !== null && guest.optOutAt === null;
  } catch (error) {
    console.error('[canSendMarketing] Error checking consent:', error);
    return false;
  }
}
