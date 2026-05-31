import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreLead } from '@/domain/sales/lead-scoring';
import { isTaxaZero } from '@/domain/finance/commission';
import type { PlanType } from '@/domain/plan/types';

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
        const scored = scoreLead({
          roomsCount: (lead as any).roomsCount ?? null,
          state: (lead as any).state ?? null,
          currentTier: lead.leadTier ?? null,
          painPoints: (lead as any).painPoints ?? null,
          buyingBehavior: (lead as any).buyingBehavior ?? null,
        });

        const metadata = JSON.parse(lead.metadata || '{}');
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            lastInteractionAt: new Date(),
            leadTier: scored.tier,
            source: utm_source ? `${lead.source}::${utm_source}` : lead.source,
            metadata: JSON.stringify({
              ...metadata,
              utm_source,
              utm_medium,
              utm_campaign,
              plan,
              url,
              referrer,
              scoredTier: scored.tier,
              score: scored.score,
              scoreReasons: scored.reasons,
              confidence: scored.confidence,
              recommendedPlan: scored.recommendedPlan,
            }),
          },
        });
      }
    }

    if (plan) {
      try {
        const LeadEvent = (prisma as any).leadEvent;
        if (LeadEvent) {
          const taxaZero = isTaxaZero(plan.toUpperCase() as PlanType);
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
                taxaZero,
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
