import { prisma } from '../../prisma';
import { type LeadProfile, type SwipeMatch, type SwipeMatchResult, type TierRecommendation, type SwipeTemplate, type PlanTier } from "./types";
import { classificarTier } from "./classifier";

const WEIGHT_SIMILARITY = 0.35;
const WEIGHT_CONV_RATE = 0.40;
const WEIGHT_RECENCY = 0.15;
const WEIGHT_DOR_MATCH = 0.10;
const DEFAULT_LIMIT = 3;

export async function matchSwipes(profile: LeadProfile, options?: { limit?: number; channel?: string; category?: string }): Promise<SwipeMatchResult> {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const candidatos = await buscarCandidatos(profile, options?.channel, options?.category);

  if (candidatos.length === 0) {
    const universais = await buscarCandidatos(profile, options?.channel, undefined);
    candidatos.push(...universais.filter(c => c.tier === "universal"));
  }

  const scored = candidatos.map(swipe => calcularMatchScore(swipe, profile));
  scored.sort((a, b) => b.rankScore - a.rankScore);
  const topMatches = scored.slice(0, limit);
  const tierRec = classificarTier(profile, topMatches);

  return { leadId: profile.id, leadEmail: profile.email, matches: topMatches, tierRecommendation: tierRec, timestamp: new Date() };
}

async function buscarCandidatos(profile: LeadProfile, channel?: string, category?: string): Promise<SwipeTemplate[]> {
  const where: any = { isActive: true };
  if (channel) where.channel = channel;
  else where.channel = { in: profile.canaisUsados.length > 0 ? profile.canaisUsados : ["whatsapp"] };
  if (category) where.category = category;
  if (profile.dor && profile.dor !== "desconhecida") {
    where.OR = [{ painType: profile.dor }, { painType: null }];
  }
  const results = await prisma.swipeTemplate.findMany({ where, orderBy: [{ convRate: "desc" }, { timesUsed: "desc" }], take: 20 });
  return results as unknown as SwipeTemplate[];
}

function calcularMatchScore(swipe: SwipeTemplate, profile: LeadProfile): SwipeMatch {
  const reasons: string[] = [];
  let similarity = 50;

  if (profile.score >= 50 && swipe.tier !== "lite") similarity += 15;
  if (profile.score >= 50 && swipe.tier === "lite") similarity -= 10;
  if (profile.score < 20 && swipe.tier === "lite") similarity += 20;

  if (swipe.painType === profile.dor) { similarity += 20; reasons.push(`Dor "${profile.dor}" bate com swipe`); }
  if (profile.qtdQuartos) {
    if (profile.qtdQuartos <= 5 && swipe.tier === "lite") similarity += 10;
    if (profile.qtdQuartos > 5 && profile.qtdQuartos <= 15 && swipe.tier === "pro") similarity += 10;
    if (profile.qtdQuartos > 15 && swipe.tier === "max") similarity += 10;
  }

  const regiaoTags = swipe.tags.filter(t => t.toLowerCase().includes(profile.regiao?.toLowerCase() || ""));
  if (regiaoTags.length > 0) { similarity += 10; reasons.push(`Tags da regiao "${profile.regiao}"`); }

  similarity = Math.min(100, Math.max(0, similarity));
  const convRate = Math.min(100, ((swipe as any).convRate || 0) * 100);
  if ((swipe as any).provenByConversion) reasons.push(`Conversao: (((swipe as any).convRate * 100).toFixed(1)}%`);

  let recency = 50;
  if ((swipe as any).lastUsedAt) {
    const diasDesdeUso = (Date.now() - (swipe as any).lastUsedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (diasDesdeUso < 7) recency = 90;
    else if (diasDesdeUso < 30) recency = 70;
    else if (diasDesdeUso < 90) recency = 50;
    else recency = 30;
  } else { recency = 60; reasons.push("Novo template"); }

  let dorMatch = 50;
  if (swipe.painType && profile.dor && swipe.painType === profile.dor) dorMatch = 100;
  else if (swipe.painType === null) dorMatch = 60;
  else dorMatch = 20;

  const rankScore = (similarity * WEIGHT_SIMILARITY) + (convRate * WEIGHT_CONV_RATE) + (recency * WEIGHT_RECENCY) + (dorMatch * WEIGHT_DOR_MATCH);

  return { swipe, matchScore: Math.round(similarity), convRate: Math.round(convRate), rankScore: Math.round(rankScore * 10) / 10, reasons };
}
