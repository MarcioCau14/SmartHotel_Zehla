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
    const totalLeads = await db.lead.count();
    const converted = await db.lead.count({ where: { status: 'converted' } });
    const activeCampaigns = await db.campaign.count({ where: { status: 'active' } });
    const totalTargets = await db.target.count();

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads,
        converted,
        conversionRate: totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : '0',
        activeCampaigns,
        totalTargets,
      },
    }, { headers: { 'X-Security-Shield': 'zero-trust-v2' } });
  } catch (error) {
    return NextResponse.json({ success: true, stats: { totalLeads: 0, converted: 0, conversionRate: '0', activeCampaigns: 0, totalTargets: 0 } }, { headers: { 'X-Security-Shield': 'zero-trust-v2' } });
  }
}