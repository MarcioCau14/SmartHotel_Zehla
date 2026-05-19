import { type TrendData, type TrendSignalInput } from "./types";
import { type TrendKeyword, type TrendSignal } from "@prisma/client";

// src/lib/trends/detector.ts


/**
 * Lógica central para detecção de sinais de tendência.
 * Compara deltas e scores para classificar a severidade do sinal.
 */
export function detectSignal(
  keyword: { keyword: string; category: string; id?: string; geo?: string },
  data: TrendData
): TrendSignalInput | null {
  const { interestScore, interestDelta } = data;
  const prevScore = data.previousScore || 50;

  // 1. BOOM de Destino: subiu mais de 20% vs semana anterior
  if (interestDelta > 20) {
    return {
      type: "destino_boom",
      keyword: keyword.keyword,
      keywordId: keyword.id,
      category: keyword.category,
      interestScore,
      deltaPercent: interestDelta,
      severity:
        interestDelta > 50 ? "critica" :
        interestDelta > 30 ? "alta" : "media",
      geo: keyword.geo || "BR",
      previousScore: prevScore,
    };
  }

  // 2. CRASH de Destino: caiu mais de 20%
  if (interestDelta < -20) {
    const absDelta = Math.abs(interestDelta);
    return {
      type: "destino_crash",
      keyword: keyword.keyword,
      keywordId: keyword.id,
      category: keyword.category,
      interestScore,
      deltaPercent: interestDelta,
      severity:
        absDelta > 50 ? "critica" :
        absDelta > 30 ? "alta" : "media",
      geo: keyword.geo || "BR",
      previousScore: prevScore,
    };
  }

  // 3. Feriado em Alta: score > 60 com keyword de feriado
  if (keyword.category === "feriado" && interestScore > 60) {
    return {
      type: "feriado_trending",
      keyword: keyword.keyword,
      keywordId: keyword.id,
      category: keyword.category,
      interestScore,
      deltaPercent: interestDelta,
      severity: "media",
      geo: "BR",
      previousScore: prevScore,
    };
  }

  // 4. Tipo de Pousada (ex: Pet-friendly)
  if (keyword.category === "tipo" && interestDelta > 25) {
    return {
      type: "tipo_pousada_trend",
      keyword: keyword.keyword,
      keywordId: keyword.id,
      category: keyword.category,
      interestScore,
      deltaPercent: interestDelta,
      severity: interestDelta > 45 ? "alta" : "media",
      geo: "BR",
      previousScore: prevScore,
    };
  }

  return null;
}
