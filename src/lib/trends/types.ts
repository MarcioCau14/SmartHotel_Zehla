export type TrendSignalType =
  | "destino_boom" | "destino_crash" | "feriado_trending" | "sazonalidade_adiantada"
  | "topic_emergente" | "concorrente_trending" | "tipo_pousada_trend"
  | "regiao_crescimento" | "cross_border" | "event_driven";

export interface TrendSignal {
  id: string;
  type: TrendSignalType;
  keyword: string;
  category: string;
  interestScore: number;
  deltaPercent: number;
  severity: "baixa" | "media" | "alta" | "critica";
  geo: string;
  dateDetected: Date;
  previousScore: number;
  agentsNotified: string[];
  actionTaken: boolean;
  createdAt: Date;
}

export interface TrendData {
  interestScore: number;
  interestDelta: number;
  volume?: number;
  previousScore: number;
  source: string;
}

export interface TrendKeyword {
  id: string;
  keyword: string;
  category: string;
  geo?: string;
  isActive: boolean;
  tier: string;
  checkFrequencyHours: number;
  lastCheckedAt?: Date;
  createdAt: Date;
}
