import { NextRequest, NextResponse } from 'next/server';

import { matchSwipes } from '@/lib/swipe/matcher';
import { prisma } from '@/lib/prisma';

import { type LeadProfile } from '@/lib/swipe/types';

import { withApiSecurity } from '@/lib/server/with-api-security';
// src/app/api/swipes/match/route.ts

async function _POST(req: NextRequest) : void {
  try {
    const { leadId, channel, category, limit } = await req.json();
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { events: { orderBy: { timestamp: 'desc' }, take: 20 } }
    });

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const profile: LeadProfile = {
      id: lead.id,
      email: lead.email || '',
      pousada: lead.property || '',
      score: lead.conversionScore || 0,
      cluster: (lead.cluster as any) || 'COLD',
      dor: (lead.painPoints as any) || 'desconhecida',
      funnelStage: (lead.funnelStage as any) || 'NEUTRAL',
      qtdQuartos: lead.roomsCount,
      regiao: lead.region,
      uf: lead.state,
      totalEventos: lead.events.length,
      canaisUsados: [...new Set(lead.events.map(e => e.eventSource))]
    };

    const result = await matchSwipes(profile, { channel, category, limit });
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } });

