import { type TrendKeyword, type TrendData, type TrendSignal } from "./types";

export function detectSignal(keyword: TrendKeyword, data: TrendData): TrendSignal | null {
  const { interestScore, interestDelta } = data;
  const prevScore = data.previousScore || 50;

  if (interestDelta > 20) {
    return {
      id: `signal_${Date.now()}`,
      type: "destino_boom",
      keyword: keyword.keyword,
      category: keyword.category,
      interestScore,
      deltaPercent: interestDelta,
      severity: interestDelta > 40 ? "critica" : interestDelta > 30 ? "alta" : "media",
      geo: keyword.geo || "BR",
      dateDetected: new Date(),
      previousScore: prevScore,
      agentsNotified: [],
      actionTaken: false,
      createdAt: new Date(),
    };
  }

  if (interestDelta < -20) {
    return {
      id: `signal_${Date.now()}`,
      type: "destino_crash",
      keyword: keyword.keyword,
      category: keyword.category,
      interestScore,
      deltaPercent: interestDelta,
      severity: interestDelta < -40 ? "critica" : interestDelta < -30 ? "alta" : "media",
      geo: keyword.geo || "BR",
      dateDetected: new Date(),
      previousScore: prevScore,
      agentsNotified: [],
      actionTaken: false,
      createdAt: new Date(),
    };
  }

  if (keyword.category === "feriado" && interestScore > 60) {
    return {
      id: `signal_${Date.now()}`,
      type: "feriado_trending",
      keyword: keyword.keyword,
      category: keyword.category,
      interestScore,
      deltaPercent: interestDelta,
      severity: interestScore > 80 ? "alta" : "media",
      geo: keyword.geo || "BR",
      dateDetected: new Date(),
      previousScore: prevScore,
      agentsNotified: [],
      actionTaken: false,
      createdAt: new Date(),
    };
  }

  return null;
}
