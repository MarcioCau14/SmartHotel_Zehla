import { prisma } from "@/lib/prisma";

export type AgentType =
  | "ZCC-REV"
  | "ZCC-MKT"
  | "ZCC-WPP"
  | "ZCC-ANA"
  | "ZCC-RES"
  | "ZCC-SWP"
  | "ZCC-HRD";

const AGENT_SIGNAL_MAP: Record<AgentType, string[]> = {
  "ZCC-REV": ["destino_boom", "destino_crash", "sazonalidade_adiantada", "regiao_crescimento"],
  "ZCC-MKT": ["topic_emergente", "tipo_pousada_trend", "regiao_crescimento", "feriado_trending", "event_driven"],
  "ZCC-WPP": ["destino_boom", "feriado_trending", "tipo_pousada_trend", "weather_boom", "holiday_bridge"],
  "ZCC-ANA": ["destino_boom", "destino_crash", "feriado_trending", "sazonalidade_adiantada", "topic_emergente", "tipo_pousada_trend", "regiao_crescimento", "weather_boom", "weather_crash", "holiday_bridge", "event_driven"],
  "ZCC-RES": ["destino_boom", "sazonalidade_adiantada", "weather_boom", "holiday_bridge", "feriado_trending"],
  "ZCC-SWP": ["tipo_pousada_trend", "topic_emergente", "destino_boom", "feriado_trending"],
  "ZCC-HRD": ["destino_crash", "weather_crash", "event_driven"],
};

const SEVERITY_PRIORITY: Record<string, number> = {
  critica: 100,
  alta: 75,
  media: 50,
  baixa: 25,
};

export async function getActiveSignals(options?: {
  severity?: string[];
  type?: string[];
  since?: Date;
  limit?: number;
}) {
  const where: any = {};

  if (options?.severity?.length) {
    where.severity = { in: options.severity };
  }
  if (options?.type?.length) {
    where.type = { in: options.type };
  }
  if (options?.since) {
    where.createdAt = { gte: options.since };
  }

  return prisma.trendSignal.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  });
}

export async function getRelevantSignalsForAgent(
  agentType: AgentType,
  options?: { limit?: number; hoursBack?: number }
) {
  const signalTypes = AGENT_SIGNAL_MAP[agentType];
  if (!signalTypes || signalTypes.length === 0) return [];

  const since = new Date(
    Date.now() - (options?.hoursBack ?? 72) * 60 * 60 * 1000
  );

  const signals = await prisma.trendSignal.findMany({
    where: {
      type: { in: signalTypes },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 20,
  });

  return signals
    .map((s) => ({ ...s, priority: getSignalPriority(s) }))
    .sort((a, b) => b.priority - a.priority);
}

export function getSignalPriority(signal: {
  severity: string | null;
  createdAt: Date;
  deltaPercent?: number | null;
  interestScore?: number | null;
}): number {
  const severityScore = SEVERITY_PRIORITY[signal.severity || "baixa"] ?? 25;

  const hoursOld =
    (Date.now() - new Date(signal.createdAt).getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - hoursOld * 2);

  const delta = Math.abs(signal.deltaPercent ?? 0);
  const deltaScore = Math.min(50, delta);

  return Math.round(severityScore * 0.5 + recencyScore * 0.3 + deltaScore * 0.2);
}
