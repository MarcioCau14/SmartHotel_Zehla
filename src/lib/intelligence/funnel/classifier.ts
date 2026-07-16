// src/lib/intelligence/funnel/classifier.ts
// Classifies leads into HOT/WARM/COLD clusters based on events and signals

import { db as prisma } from '../../db';
import { FunnelCluster, PainCluster, EventType } from './types';

const EVENT_WEIGHTS: Record<EventType, number> = {
  email_sent: 0,
  email_opened: 5,
  email_clicked: 15,
  email_bounced: -10,
  whatsapp_sent: 0,
  whatsapp_delivered: 2,
  whatsapp_replied: 25,
  whatsapp_read: 3,
  lp_visited: 10,
  lp_cta_clicked: 20,
  'ray-x_requested': 30,
  'ray-x_delivered': 5,
  trial_started: 40,
  payment_initiated: 35,
  payment_completed: 50,
  payment_failed: -5,
  referral_made: 20,
  nps_submitted: 10,
  churn_risk: -30,
  upgrade_detected: 25,
};

const HOT_THRESHOLD = 60;
const WARM_THRESHOLD = 25;

export async function classifyLead(leadId: string): Promise<{ cluster: FunnelCluster; painCluster: PainCluster; totalScore: number }> {
  const events = await prisma.funnelEvent.findMany({
    where: { leadId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  let totalScore = 0;
  const painCounts: Record<string, number> = { financeira: 0, operacional: 0, ocupacao: 0 };

  for (const event of events) {
    const weight = EVENT_WEIGHTS[event.type as EventType] ?? 0;
    const decay = calculateDecay(event.createdAt);
    totalScore += weight * decay;

    if (event.painCluster && painCounts[event.painCluster] !== undefined) {
      painCounts[event.painCluster] += 1;
    }
  }

  totalScore = Math.max(0, Math.min(100, totalScore));

  let cluster: FunnelCluster;
  if (totalScore >= HOT_THRESHOLD) {
    cluster = 'HOT';
  } else if (totalScore >= WARM_THRESHOLD) {
    cluster = 'WARM';
  } else {
    cluster = 'COLD';
  }

  const painCluster = determinePainCluster(painCounts);

  return { cluster, painCluster, totalScore: Math.round(totalScore) };
}

function calculateDecay(eventDate: Date): number {
  const daysSinceEvent = (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceEvent <= 1) return 1.0;
  if (daysSinceEvent <= 3) return 0.8;
  if (daysSinceEvent <= 7) return 0.6;
  if (daysSinceEvent <= 14) return 0.4;
  if (daysSinceEvent <= 30) return 0.2;
  return 0.1;
}

function determinePainCluster(counts: Record<string, number>): PainCluster {
  let maxCount = 0;
  let maxPain: PainCluster = 'desconhecida';

  for (const [pain, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxPain = pain as PainCluster;
    }
  }

  return maxPain;
}

export async function batchClassifyAllLeads(): Promise<{ classified: number; hot: number; warm: number; cold: number }> {
  const leads = await prisma.lead.findMany({
    where: { status: { not: 'BLACKLISTED' } },
    select: { id: true },
  });

  let hot = 0;
  let warm = 0;
  let cold = 0;

  for (const lead of leads) {
    const result = await classifyLead(lead.id);

    await prisma.funnelScore.upsert({
      where: { leadId: lead.id },
      create: {
        leadId: lead.id,
        totalScore: result.totalScore,
        engagementScore: Math.round(result.totalScore * 0.4),
        intentScore: Math.round(result.totalScore * 0.4),
        fitScore: Math.round(result.totalScore * 0.2),
        cluster: result.cluster,
        painCluster: result.painCluster,
      },
      update: {
        totalScore: result.totalScore,
        cluster: result.cluster,
        painCluster: result.painCluster,
        previousCluster: { set: undefined },
        lastClusterChange: result.cluster !== undefined ? new Date() : undefined,
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        cluster: result.cluster,
        funnelStage: result.cluster,
      },
    });

    if (result.cluster === 'HOT') hot++;
    else if (result.cluster === 'WARM') warm++;
    else cold++;
  }

  return { classified: leads.length, hot, warm, cold };
}
