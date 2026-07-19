import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyZCCAccessOrReject } from '@/lib/zcc-security';

export async function GET(request: NextRequest) {
  // ── Security Gate V3 — 6-Layer Protection ──
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  try {
    const targets = await db.target.findMany({
      orderBy: { priority: 'desc' },
    });

    const mapped = await Promise.all(
      targets.map(async (target) => {
        const leadCount = await db.lead.count({ where: { targetId: target.id } });
        return {
          id: target.id,
          name: target.name,
          domain: target.domain || '',
          city: target.city || '',
          state: target.state || '',
          priority: target.priority || 1,
          status: target.status as 'active' | 'pending' | 'inactive',
          leadCount,
        };
      })
    );

    return NextResponse.json(mapped, { headers: { 'X-Security-Shield': 'zero-trust-v2' } });
  } catch (error) {
    console.error('[ZCC Targets]', error);
    return NextResponse.json([], { status: 500, headers: { 'X-Security-Shield': 'zero-trust-v2' } });
  }
}