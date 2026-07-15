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