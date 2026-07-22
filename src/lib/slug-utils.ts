import { db } from '@/lib/db';

/**
 * Generate a unique slug for guest guides
 */
export async function generateSlug(base: string, _tenantId?: string): Promise<string> {
  let slug = base || 'guia';
  let attempts = 0;

  while (attempts < 20) {
    const suffix = attempts > 0 ? `-${attempts}` : '';
    const candidate = `${slug}${suffix}`;

    const existing = await db.guestGuide.findFirst({
      where: { slug: candidate },
    });

    if (!existing) return candidate;
    attempts++;
  }

  // Fallback with timestamp
  return `${slug}-${Date.now()}`;
}
