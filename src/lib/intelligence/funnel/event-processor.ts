// src/lib/intelligence/funnel/event-processor.ts
// Processes funnel events, updates scores, and triggers next actions

import { db as prisma } from '../../db';
import { FunnelEventInput, NextAction } from './types';
import { updateLeadScore } from './scorer';
import { determineNextAction } from './next-action';

export async function processEvent(input: FunnelEventInput): Promise<{ eventId: string; nextAction: NextAction }> {
  const event = await prisma.funnelEvent.create({
    data: {
      leadId: input.leadId,
      campaignId: input.campaignId,
      type: input.type,
      painCluster: input.painCluster,
      score: input.score ?? 0,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });

  await prisma.lead.update({
    where: { id: input.leadId },
    data: { lastInteractionAt: new Date() },
  });

  const scores = await updateLeadScore(input.leadId);

  const nextAction = await determineNextAction(input.leadId, scores.cluster, scores.painCluster);

  return { eventId: event.id, nextAction };
}

export async function processWebhookEvent(webhookData: {
  source: string;
  eventType: string;
  leadEmail?: string;
  leadPhone?: string;
  campaignId?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ eventId?: string; error?: string }> {
  let leadId: string | undefined;

  if (webhookData.leadEmail) {
    const lead = await prisma.lead.findFirst({
      where: { email: webhookData.leadEmail },
      select: { id: true },
    });
    leadId = lead?.id;
  }

  if (!leadId && webhookData.leadPhone) {
    const lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { phone: webhookData.leadPhone },
          { whatsapp: webhookData.leadPhone },
        ],
      },
      select: { id: true },
    });
    leadId = lead?.id;
  }

  if (!leadId) {
    return { error: 'Lead not found for webhook event' };
  }

  const funnelEventType = mapWebhookToFunnelEvent(webhookData.eventType);

  if (!funnelEventType) {
    return { error: `Unknown event type: ${webhookData.eventType}` };
  }

  const result = await processEvent({
    leadId,
    campaignId: webhookData.campaignId,
    type: funnelEventType,
    metadata: webhookData.metadata,
  });

  return { eventId: result.eventId };
}

function mapWebhookToFunnelEvent(eventType: string): FunnelEventInput['type'] | null {
  const mapping: Record<string, FunnelEventInput['type']> = {
    open: 'email_opened',
    click: 'email_clicked',
    delivered: 'email_sent',
    bounce: 'email_bounced',
    whatsapp_sent: 'whatsapp_sent',
    whatsapp_delivered: 'whatsapp_delivered',
    whatsapp_reply: 'whatsapp_replied',
    whatsapp_read: 'whatsapp_read',
    page_view: 'lp_visited',
    cta_click: 'lp_cta_clicked',
    rayx_request: 'ray-x_requested',
    rayx_delivery: 'ray-x_delivered',
    trial_start: 'trial_started',
    payment_start: 'payment_initiated',
    payment_success: 'payment_completed',
    payment_fail: 'payment_failed',
  };

  return mapping[eventType] ?? null;
}

export async function getLeadFunnelProfile(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) return null;

  const funnelScore = await prisma.funnelScore.findUnique({
    where: { leadId },
  });

  const eventCount = await prisma.funnelEvent.count({
    where: { leadId },
  });

  const nextAction = await determineNextAction(
    leadId,
    (funnelScore?.cluster as 'HOT' | 'WARM' | 'COLD') ?? 'COLD',
    (funnelScore?.painCluster as any) ?? undefined
  );

  return {
    leadId,
    cluster: funnelScore?.cluster ?? 'COLD',
    previousCluster: funnelScore?.previousCluster ?? undefined,
    painCluster: funnelScore?.painCluster ?? 'desconhecida',
    totalScore: funnelScore?.totalScore ?? 0,
    tier: (lead.leadTier || 'LITE') as 'MAX' | 'PRO' | 'LITE',
    lastInteraction: lead.lastInteractionAt ?? undefined,
    eventCount,
    nextAction,
  };
}
