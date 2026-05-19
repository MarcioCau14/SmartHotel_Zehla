import { NextRequest, NextResponse } from 'next/server';

import { matchSwipes } from '@/lib/swipe/matcher';
import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

/**
 * GET /api/zcc/swipes/match?leadId=xxx
 * Retorna os melhores swipes para um lead específico.
 */
async function _GET(req: NextRequest) : void {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const channel = searchParams.get('channel') || undefined;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { events: { take: 10, orderBy: { timestamp: 'desc' } } }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Adaptar Lead do Prisma para LeadProfile do Matcher
    const profile = {
      id: lead.id,
      email: lead.email || '',
      score: lead.score || 0,
      tier: lead.tierSugerido || 'lite',
      dor: lead.painPoints || 'desconhecida',
      canaisUsados: lead.events.map(e => String(e.type)),
      qtdQuartos: lead.roomsCount || 0,
    };

    const result = await matchSwipes(profile as any, { limit, channel });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('❌ [SWIPE API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

