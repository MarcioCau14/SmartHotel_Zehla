// src/lib/trends/types.ts

export type TrendSignalType =
  | "destino_boom"          // Busca por destino subiu >20%
  | "destino_crash"         // Busca por destino caiu >20%
  | "feriado_trending"      // Feriado começou a ser buscado antes do previsto
  | "sazonalidade_adiantada" // Alta estação começou mais cedo que o histórico
  | "topic_emergente"       // Novo tópico de viagem trending (ex: glamping)
  | "tipo_pousada_trend"    // Busca por tipo específico (pet-friendly, romântico)
  | "regiao_crescimento"    // Região inteira crescendo (ex: "Litoral Sul")
  | "weather_boom"          // Previsão de clima favorável para destino
  | "weather_crash"         // Previsão de clima desfavorável
  | "holiday_bridge"        // Feriado forma ponte estendida
  | "event_driven";         // Evento específico causando pico

export interface TrendData {
  interestScore: number;
  interestDelta: number;
  previousScore?: number;
  volume?: number;
  pageviews?: number;
  lastCheckedAt?: Date;
}

export interface TrendSignalInput {
  type: TrendSignalType;
  keyword: string;
  keywordId?: string;
  category: string;
  interestScore: number;
  deltaPercent: number;
  severity: "baixa" | "media" | "alta" | "critica";
  geo?: string;
  previousScore?: number;
}
