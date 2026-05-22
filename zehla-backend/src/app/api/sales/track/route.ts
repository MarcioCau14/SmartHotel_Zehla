import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leadId,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      plan,
      ref,
      url,
      referrer,
    } = body;

    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (lead) {
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            lastInteractionAt: new Date(),
            leadTier: 'WARM',
            source: utm_source ? `${lead.source}::${utm_source}` : lead.source,
            metadata: JSON.stringify({
              utm_source,
              utm_medium,
              utm_campaign,
              plan,
              url,
              referrer,
            }),
          },
        });
      }
    }

    if (plan) {
      try {
        const LeadEvent = (prisma as any).leadEvent;
        if (LeadEvent) {
          await LeadEvent.create({
            data: {
              leadId: leadId || 'anonymous',
              type: 'PAGE_VISIT',
              metadata: JSON.stringify({
                plan,
                page: url,
                utm_source,
                utm_medium,
                utm_campaign,
                referrer,
              }),
            },
          });
        }
      } catch {}
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[SALES TRACK] Error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
