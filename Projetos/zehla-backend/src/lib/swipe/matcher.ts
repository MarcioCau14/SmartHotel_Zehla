import {
import { classificarTier } from "./classifier";

import { prisma } from '@/lib/prisma';


// src/lib/swipe/matcher.ts
  type LeadProfile,
  type SwipeMatch,
  type SwipeMatchResult,
  type SwipeTemplate,
} from "./types";

const WEIGHT_SIMILARITY  = 0.25;
const WEIGHT_CONV_RATE   = 0.30;
const WEIGHT_RECENCY     = 0.10;
const WEIGHT_DOR_MATCH   = 0.15;
const WEIGHT_TREND_MATCH = 0.20; // Nova dimensão (Camada 0)

const DEFAULT_LIMIT = 3;

export async function matchSwipes(
  profile: LeadProfile,
  options?: { limit?: number; channel?: string; category?: string; forceTier?: string }
): Promise<SwipeMatchResult> {
  // Tier-based logic for limits
  const leadTier = profile.tier || 'lite';
  const tierLimits: Record<string, number> = {
    lite: 3,
    pro: 10,
    max: 25
  };

  const limit = options?.limit ?? tierLimits[leadTier] ?? DEFAULT_LIMIT;
  const channel = options?.channel;
  const category = options?.category;

  // Buscar sinais ativos de tendência (ZCC-TRENDS)
  const activeSignals = await prisma.trendSignal.findMany({
    where: { 
      createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // Sinais das últimas 48h
      severity: { in: ["alta", "critica"] }
    }
  });

  let candidatos = await buscarCandidatos(profile, channel, category);

  // Fallback para templates universais se não houver match específico
  if (candidatos.length === 0) {
    candidatos = await buscarCandidatos(profile, channel, undefined);
    candidatos = candidatos.filter(c => c.tier === "universal" || c.tier === leadTier);
  }

  const scored = candidatos.map(swipe =>
    calcularMatchScore(swipe as unknown as SwipeTemplate, profile, activeSignals)
  );

  scored.sort((a, b) => b.rankScore - a.rankScore);
  
  // Aplicar limites e filtros de segurança
  const topMatches = scored.slice(0, limit);
  const tierRec = classificarTier(profile, topMatches);

  return {
    leadId: profile.id,
    leadEmail: profile.email,
    matches: topMatches,
    tierRecommendation: tierRec,
    metadata: {
      appliedLimit: limit,
      totalCandidatos: candidatos.length,
      leadTier,
      activeTrendsCount: activeSignals.length
    },
    timestamp: new Date(),
  };
}

async function buscarCandidatos(
  profile: LeadProfile,
  channel?: string,
  category?: string
): Promise<any[]> {
  const where: any = { isActive: true };

  if (channel) {
    where.channel = channel;
  } else if (profile.canaisUsados && profile.canaisUsados.length > 0) {
    where.channel = { in: profile.canaisUsados };
  }

  if (category) {
    where.category = category;
  }

  if (profile.dor && profile.dor !== "desconhecida") {
    where.OR = [
      { painType: profile.dor },
      { painType: null },
    ];
  }

  return await prisma.swipeTemplate.findMany({
    where,
    orderBy: [{ convRate: "desc" }, { timesUsed: "desc" }],
    take: 30,
  });
}

function calcularMatchScore(
  swipe: SwipeTemplate,
  profile: LeadProfile,
  activeSignals: unknown[]
): SwipeMatch {
  const reasons: string[] = [];
  
  // 1. SIMILARITY (Perfis e Dados Estruturais) - Base 0-100
  let similarity = 50; 
  if (profile.score >= 80 && swipe.tier === "max") similarity += 20;
  if (profile.score < 30 && swipe.tier === "lite") similarity += 20;

  if (profile.qtdQuartos) {
    if (profile.qtdQuartos <= 10 && swipe.tier === "lite") similarity += 15;
    if (profile.qtdQuartos > 10 && profile.qtdQuartos <= 25 && swipe.tier === "pro") similarity += 15;
    if (profile.qtdQuartos > 25 && swipe.tier === "max") similarity += 15;
  }
  similarity = Math.min(100, Math.max(0, similarity));

  // 2. CONVERSION (Histórico de Performance) - Base 0-100
  const convRate = Math.min(100, (swipe.convRate || 0) * 100);
  if (swipe.provenByConversion) {
    reasons.push(`🔥 Performance Provada: ${(swipe.convRate * 100).toFixed(1)}% de conversão`);
  }

  // 3. RECENCY (Uso e Frescor do Template) - Base 0-100
  let recency = 50;
  if (swipe.lastUsedAt) {
    const daysSince = (Date.now() - new Date(swipe.lastUsedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 3) recency = 100; // Recém usado e validado
    else if (daysSince < 14) recency = 80;
    else if (daysSince > 90) recency = 30; // "Esfriando"
  } else {
    recency = 70; // Novo/Nunca usado é boa oportunidade
    reasons.push("✨ Template Inédito para este lead");
  }

  // 4. PAIN MATCH (Alinhamento de Dor/Psicográfico) - Base 0-100
  let dorMatch = 50;
  if (swipe.painType === profile.dor) {
    dorMatch = 100;
    reasons.push(`🎯 Match de Dor: Alinhado com trauma de "${profile.dor}"`);
  } else if (swipe.painType === "universal") {
    dorMatch = 70;
  } else {
    dorMatch = 20;
  }

  // 5. TREND MATCH (ZCC-TRENDS) - Base 0-100 (Nova Dimensão Camada 0)
  let trendScore = 50;
  const matchedSignal = activeSignals.find(s => 
    swipe.content.toLowerCase().includes(s.keyword.toLowerCase()) ||
    (s.type === "tipo_pousada_trend" && swipe.category === s.keyword)
  );

  if (matchedSignal) {
    trendScore = 100;
    reasons.push(`📈 Trend Alert: Este template coincide com a tendência de "${matchedSignal.keyword}"`);
  }

  // CÁLCULO FINAL (5-DIMENSIONAL)
  const rankScore =
    (similarity * WEIGHT_SIMILARITY) +
    (convRate * WEIGHT_CONV_RATE) +
    (recency * WEIGHT_RECENCY) +
    (dorMatch * WEIGHT_DOR_MATCH) +
    (trendScore * WEIGHT_TREND_MATCH);

  return {
    swipe,
    matchScore: Math.round(similarity),
    convRate: Math.round(convRate),
    rankScore: Math.round(rankScore * 10) / 10,
    reasons,
  };
}

/**
 * ZEHLA Swipe Matcher (ZSM) - Wrapper para integração com a Esteira de Warmup
 */
export class SwipeMatcher {
  static async getBestTemplate(painType: string): Promise<{ id: string; content: string }> {
    // Simula um perfil mínimo para o matcher
    const mockProfile: LeadProfile = {
      id: 'warmup-temp',
      email: 'warmup@zehla.com',
      dor: painType as any,
      score: 80,
      tier: 'pro'
    };

    const result = await matchSwipes(mockProfile, { limit: 1, category: 'prospecção' });
    
    if (result.matches.length > 0) {
      return {
        id: result.matches[0].swipe.id,
        content: result.matches[0].swipe.content
      };
    }

    // Fallback Universal
    return {
      id: 'universal-fallback',
      content: "Olá! Notei que vocês estão com alguns desafios na gestão da pousada. O Zehla pode ajudar a automatizar sua operação e reduzir custos com comissões. Vamos conversar?"
    };
  }
}

