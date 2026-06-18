import { type LeadProfile, type TierRecommendation, type TierSignal, type PlanTier, type SwipeMatch } from "./types";

export function classificarTier(profile: LeadProfile, topSwipes: SwipeMatch[]): TierRecommendation {
  const signals: TierSignal[] = [];
  let liteScore = 0, proScore = 0, maxScore = 0;

  if (profile.qtdQuartos !== null) {
    if (profile.qtdQuartos <= 5) { liteScore += 30; signals.push({ signal: "qtd_quartos_pequeno", weight: 0.3, description: `${profile.qtdQuartos} quartos — porte LITE` }); }
    else if (profile.qtdQuartos <= 15) { proScore += 30; signals.push({ signal: "qtd_quartos_medio", weight: 0.3, description: `${profile.qtdQuartos} quartos — porte PRO` }); }
    else { maxScore += 30; signals.push({ signal: "qtd_quartos_grande", weight: 0.3, description: `${profile.qtdQuartos} quartos — porte MAX` }); }
  }

  if (profile.score >= 60) { maxScore += 20; signals.push({ signal: "score_alto", weight: 0.2, description: `Score ${profile.score} — potencial MAX` }); }
  else if (profile.score >= 30) { proScore += 20; signals.push({ signal: "score_medio", weight: 0.2, description: `Score ${profile.score} — potencial PRO` }); }
  else { liteScore += 10; signals.push({ signal: "score_baixo", weight: 0.1, description: `Score ${profile.score} — comecar com LITE` }); }

  if (profile.dor === "ocupacao") { maxScore += 25; signals.push({ signal: "dor_ocupacao", weight: 0.25, description: "Dor: ocupacao — precisa de Radar (MAX)" }); }
  else if (profile.dor === "operacional") { proScore += 25; signals.push({ signal: "dor_operacional", weight: 0.25, description: "Dor: operacional — automacao multi-canal (PRO)" }); }
  else if (profile.dor === "financeiro") { liteScore += 15; proScore += 15; signals.push({ signal: "dor_financeiro", weight: 0.15, description: "Dor: financeiro — LITE → PRO" }); }

  const canaisUnicos = [...new Set(profile.canaisUsados)].length;
  if (canaisUnicos >= 3) { maxScore += 15; signals.push({ signal: "multi_canal", weight: 0.15, description: `${canaisUnicos} canais — omnichannel (PRO/MAX)` }); }
  else if (canaisUnicos >= 2) { proScore += 10; signals.push({ signal: "dois_canais", weight: 0.1, description: `${canaisUnicos} canais — PRO suficiente` }); }

  if (profile.totalEventos >= 10) { maxScore += 10; signals.push({ signal: "eventos_alto", weight: 0.1, description: `${profile.totalEventos} eventos — altamente engajado` }); }
  else if (profile.totalEventos >= 5) { proScore += 10; signals.push({ signal: "eventos_medio", weight: 0.1, description: `${profile.totalEventos} eventos — interessado` }); }

  if (topSwipes.length > 0) {
    const topSwipeTier = topSwipes[0].swipe.tier;
    if (topSwipeTier === "pro") proScore += 10;
    if (topSwipeTier === "max") maxScore += 10;
    signals.push({ signal: "swipe_match_tier", weight: 0.1, description: `Swipe top match: ${topSwipeTier.toUpperCase()}` });
  }

  const totalScore = liteScore + proScore + maxScore;
  const tierScores: Record<PlanTier, { score: number; pct: number }> = {
    lite: { score: liteScore, pct: totalScore > 0 ? liteScore / totalScore : 0.33 },
    pro: { score: proScore, pct: totalScore > 0 ? proScore / totalScore : 0.34 },
    max: { score: maxScore, pct: totalScore > 0 ? maxScore / totalScore : 0.33 },
    universal: { score: 0, pct: 0 },
  };

  const sorted = Object.entries(tierScores).filter(([t]) => t !== "universal").sort(([, a], [, b]) => b.score - a.score);
  const winnerTier = sorted[0][0] as PlanTier;
  const winnerPct = sorted[0][1].pct;
  const altTier = sorted[1][0] as PlanTier;
  const altPct = sorted[1][1].pct;

  const reasons = signals.filter(s => s.weight > 0).sort((a, b) => b.weight - a.weight).map(s => s.description);

  return { tier: winnerTier, confidence: Math.round(winnerPct * 100) / 100, reasons, alternativeTier: altTier, alternativeConfidence: Math.round(altPct * 100) / 100, signals };
}
