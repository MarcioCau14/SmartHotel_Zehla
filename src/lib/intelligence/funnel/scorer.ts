// src/lib/intelligence/funnel/scorer.ts
// Dynamic scoring engine for funnel leads

import { db as prisma } from '../../db';
import { FunnelScoreUpdate, PainCluster } from './types';

export async function calculateScores(leadId: string): Promise<FunnelScoreUpdate> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      emailTrackings: { orderBy: { openedAt: 'desc' }, take: 10 },
    },
  });

  if (!lead) {
    throw new Error(`Lead not found: ${leadId}`);
  }

  const events = await prisma.funnelEvent.findMany({
    where: { leadId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const engagementScore = calcEngagement(events, lead.emailTrackings.length);
  const intentScore = calcIntent(events);
  const fitScore = calcFit(lead);

  const totalScore = Math.round(
    engagementScore * 0.35 +
    intentScore * 0.40 +
    fitScore * 0.25
  );

  const cluster = totalScore >= 60 ? 'HOT' : totalScore >= 25 ? 'WARM' : 'COLD';

  const painCluster = detectPainCluster(events);

  return {
    totalScore,
    engagementScore: Math.round(engagementScore),
    intentScore: Math.round(intentScore),
    fitScore: Math.round(fitScore),
    cluster,
    painCluster,
  };
}

function calcEngagement(events: { type: string; createdAt: Date }[], emailOpens: number): number {
  const interactionCount = events.filter(e =>
    ['email_opened', 'email_clicked', 'whatsapp_replied', 'lp_visited', 'lp_cta_clicked'].includes(e.type)
  ).length;

  const recencyBonus = events.length > 0 && (Date.now() - events[0].createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000 ? 10 : 0;

  return Math.min(100, (interactionCount * 8) + (emailOpens * 3) + recencyBonus);
}

function calcIntent(events: { type: string }[]): number {
  const highIntentEvents = ['ray-x_requested', 'trial_started', 'payment_initiated', 'payment_completed', 'lp_cta_clicked'];
  const mediumIntentEvents = ['email_clicked', 'whatsapp_replied', 'lp_visited'];

  let score = 0;
  for (const event of events) {
    if (highIntentEvents.includes(event.type)) score += 25;
    else if (mediumIntentEvents.includes(event.type)) score += 10;
  }

  return Math.min(100, score);
}

function calcFit(lead: {
  roomsCount?: number | null;
  scoreValid?: number | null;
  validationScore?: number | null;
  score?: number | null;
  tierConfidence?: number | null;
}): number {
  let score = 0;

  if (lead.roomsCount && lead.roomsCount > 0) {
    if (lead.roomsCount >= 30) score += 30;
    else if (lead.roomsCount >= 15) score += 20;
    else score += 10;
  }

  if (lead.scoreValid && lead.scoreValid > 0) {
    score += (lead.scoreValid / 100) * 25;
  }

  if (lead.validationScore && lead.validationScore > 0) {
    score += (lead.validationScore / 100) * 20;
  }

  if (lead.score && lead.score > 0) {
    score += (lead.score / 100) * 15;
  }

  if (lead.tierConfidence && lead.tierConfidence > 0) {
    score += lead.tierConfidence * 10;
  }

  return Math.min(100, score);
}

function detectPainCluster(events: { type: string; painCluster?: string | null }[]): PainCluster {
  const counts: Record<string, number> = { financeira: 0, operacional: 0, ocupacao: 0 };

  for (const event of events) {
    if (event.painCluster && counts[event.painCluster] !== undefined) {
      counts[event.painCluster]++;
    }
  }

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

export async function updateLeadScore(leadId: string): Promise<FunnelScoreUpdate> {
  const scores = await calculateScores(leadId);

  const existing = await prisma.funnelScore.findUnique({
    where: { leadId },
  });

  const clusterChanged = existing && existing.cluster !== scores.cluster;

  await prisma.funnelScore.upsert({
    where: { leadId },
    create: {
      leadId,
      ...scores,
    },
    update: {
      ...scores,
      previousCluster: clusterChanged ? existing?.cluster : undefined,
      lastClusterChange: clusterChanged ? new Date() : undefined,
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      cluster: scores.cluster,
      funnelStage: scores.cluster,
    },
  });

  return scores;
}
