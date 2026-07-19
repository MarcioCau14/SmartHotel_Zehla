import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyZCCAccessOrReject } from '@/lib/zcc-security';

export async function GET(request: NextRequest) {
  // ── Security Gate V3 — 6-Layer Protection ──
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  try {
    const campaigns = await db.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const mapped = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      type: (c.type || 'whatsapp') as 'whatsapp' | 'email' | 'ads',
      status: (c.status || 'draft') as 'active' | 'paused' | 'completed' | 'draft',
      sent: c.totalSent,
      delivered: c.totalDelivered,
      read: c.totalRead,
      replied: c.totalReplied,
      total: c.totalDelivered || 100,
      createdAt: c.createdAt.toISOString().split('T')[0],
      template: c.messageTemplate || c.name,
    }));

    return NextResponse.json(mapped, { headers: { 'X-Security-Shield': 'zero-trust-v2' } });
  } catch (error) {
    console.error('[ZCC Campaigns]', error);
    return NextResponse.json([], { status: 500, headers: { 'X-Security-Shield': 'zero-trust-v2' } });
  }
}