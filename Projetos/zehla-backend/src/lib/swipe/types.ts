// src/lib/swipe/types.ts
import { type Cluster, type DorType, type FunnelStage } from "../events/types";

export const PLAN_TIERS = ["lite", "pro", "max", "universal"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const TIER_LABELS: Record<PlanTier, string> = {
  lite: "LITE",
  pro: "PRO",
  max: "MAX",
  universal: "Universal",
};

export const TIER_COLORS: Record<PlanTier, string> = {
  lite: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pro: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  max: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  universal: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export const TIER_PRICES: Record<PlanTier, number> = {
  lite: 248,
  pro: 448,
  max: 798,
  universal: 0,
};

export const SWIPE_CHANNELS = ["whatsapp", "email", "instagram", "voice", "chat_widget"] as const;
export type SwipeChannel = (typeof SWIPE_CHANNELS)[number];

export const CHANNEL_LABELS: Record<SwipeChannel, string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
  instagram: "Instagram",
  voice: "Voz (ZEHLA Voice)",
  chat_widget: "Chat Widget",
};

export const SWIPE_CATEGORIES = [
  "saudacao", "preco", "disponibilidade", "followup", 
  "recuperacao", "upsell", "onboarding", "objecao", 
  "encerramento", "promocao", "review", "recomendacao"
] as const;
export type SwipeCategory = (typeof SWIPE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<SwipeCategory, string> = {
  saudacao: "Saudação",
  preco: "Preço",
  disponibilidade: "Disponibilidade",
  followup: "Follow-up",
  recuperacao: "Recuperação",
  upsell: "Upsell de Plano",
  onboarding: "Onboarding",
  objecao: "Objeção",
  encerramento: "Encerramento",
  promocao: "Promoção",
  review: "Review/Avaliação",
  recomendacao: "Recomendação",
};

export interface SwipeTemplate {
  id: string;
  title: string;
  content: string;
  variables: string; 
  channel: string;
  category: string;
  tone: string;
  tier: string;
  painType: string | null;
  tags: string;
  timesUsed: number;
  conversions: number;
  convRate: number;
  lastUsedAt: Date | null;
  isAiGenerated: boolean;
  provenByConversion: boolean;
  createdAt: Date;
}

export interface LeadProfile {
  id: string;
  email: string;
  pousada: string;
  score: number;
  cluster: Cluster;
  dor: DorType | null;
  funnelStage: FunnelStage;
  qtdQuartos: number | null;
  regiao: string | null;
  uf: string | null;
  totalEventos: number;
  canaisUsados: string[];
}

export interface SwipeMatch {
  swipe: SwipeTemplate;
  matchScore: number;
  convRate: number;
  rankScore: number;
  reasons: string[];
}

export interface SwipeMatchResult {
  leadId: string;
  leadEmail: string;
  matches: SwipeMatch[];
  tierRecommendation: TierRecommendation;
  timestamp: Date;
}

export interface TierRecommendation {
  tier: PlanTier;
  confidence: number;
  reasons: string[];
  alternativeTier?: PlanTier;
  alternativeConfidence?: number;
  signals: TierSignal[];
}

export interface TierSignal {
  signal: string;
  weight: number;
  description: string;
}
