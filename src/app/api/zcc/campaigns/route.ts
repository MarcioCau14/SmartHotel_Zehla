import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiRatelimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = await apiRatelimit.limit(`api:${clientIp}:${new URL(request.url).pathname}`);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Muitas requisições.', retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)), 'X-RateLimit-Remaining': '0' } }
    );
  }

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