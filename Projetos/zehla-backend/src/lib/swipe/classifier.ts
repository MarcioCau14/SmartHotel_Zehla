// src/lib/swipe/classifier.ts
import {
  type LeadProfile,
  type TierRecommendation,
  type TierSignal,
  type PlanTier,
  type SwipeMatch,
  TIER_PRICES,
} from "./types";

/**
 * ZEHLA Tier Classifier v4.1 - "The ROI Engine"
 * Classifica o lead em um tier de plano com confiança e projeção de ROI.
 */
export function classificarTier(
  profile: LeadProfile,
  topSwipes: SwipeMatch[]
): TierRecommendation {
  const signals: TierSignal[] = [];
  let liteScore = 0;
  let proScore = 0;
  let maxScore = 0;

  // ── SINAL 1: BENCHMARK ICP (O Coração da Inteligência) ──
  const nomeLead = profile.pousada?.toLowerCase() || "";
  
  // Detecção de Pousadas de Elite (Caminho do Rei, Village Praia do Rosa)
  if (nomeLead.includes("caminho do rei") || nomeLead.includes("village praia do rosa") || profile.uf === 'SC' && profile.score > 90) {
    maxScore += 50; 
    signals.push({ 
      signal: "icp_max_benchmark", 
      weight: 0.5, 
      description: "Perfil detectado como High-Ticket (Similar a Caminho do Rei) — Foco em Taxa Zero." 
    });
  } 
  // Detecção de Pousadas Compactas (Casa dos Ventos)
  else if (nomeLead.includes("casa dos ventos") || (profile.qtdQuartos && profile.qtdQuartos <= 3)) {
    liteScore += 40;
    signals.push({ 
      signal: "icp_lite_benchmark", 
      weight: 0.4, 
      description: "Perfil Pousada Compacta (Similar a Casa dos Ventos) — Foco em Baixo Custo Fixo." 
    });
  }

  // ── SINAL 2: QUANTIDADE DE SUÍTES ──
  if (profile.qtdQuartos !== null) {
    if (profile.qtdQuartos <= 5) {
      liteScore += 30;
      signals.push({ signal: "porte_lite", weight: 0.3, description: `${profile.qtdQuartos} suítes — Perfil LITE.` });
    } else if (profile.qtdQuartos <= 15) {
      proScore += 30;
      signals.push({ signal: "porte_pro", weight: 0.3, description: `${profile.qtdQuartos} suítes — Perfil PRO.` });
    } else {
      maxScore += 30;
      signals.push({ signal: "porte_max", weight: 0.3, description: `${profile.qtdQuartos} suítes — Perfil MAX.` });
    }
  }

  // ── SINAL 3: SCORE DO LIS & DOR ──
  if (profile.score >= 60) {
    maxScore += 20;
    signals.push({ signal: "engajamento_alto", weight: 0.2, description: `Score ${profile.score} — Lead maduro para Automação Total.` });
  }

  if (profile.dor === "ocupacao") {
    maxScore += 25;
    signals.push({ signal: "dor_ocupacao", weight: 0.25, description: "Dor de Ocupação — Radar Neural (Exclusivo MAX) é a solução." });
  } else if (profile.dor === "operacional") {
    proScore += 25;
    signals.push({ signal: "dor_operacional", weight: 0.25, description: "Dor Operacional — Automação Multi-canal PRO recomendada." });
  }

  // ── CÁLCULO FINAL DE CONFIANÇA ──
  const totalScore = liteScore + proScore + maxScore;
  const tierScores: Record<PlanTier, { score: number; pct: number }> = {
    lite: { score: liteScore, pct: totalScore > 0 ? liteScore / totalScore : 0.33 },
    pro:  { score: proScore,  pct: totalScore > 0 ? proScore / totalScore : 0.34 },
    max:  { score: maxScore,  pct: totalScore > 0 ? maxScore / totalScore : 0.33 },
    universal: { score: 0, pct: 0 },
  };

  const sorted = Object.entries(tierScores)
    .filter(([t]) => t !== "universal")
    .sort(([, a], [, b]) => b.score - a.score);

  const winnerTier = sorted[0][0] as PlanTier;
  const winnerPct = sorted[0][1].pct;
  const altTier = sorted[1][0] as PlanTier;
  const altPct = sorted[1][1].pct;

  // ── PROJEÇÃO DE VALOR (ROI) ──
  const valorMensal = TIER_PRICES[winnerTier];
  const confianca = Math.round(winnerPct * 100) / 100;
  const roiEsperado = Math.round(valorMensal * confianca);

  return {
    tier: winnerTier,
    confidence: confianca,
    reasons: signals.sort((a, b) => b.weight - a.weight).map(s => s.description),
    alternativeTier: altTier,
    alternativeConfidence: Math.round(altPct * 100) / 100,
    signals,
    // Estendendo o retorno com metadados financeiros para o ZCC
    roiProjection: roiEsperado,
    monthlyPrice: valorMensal
  };
}
