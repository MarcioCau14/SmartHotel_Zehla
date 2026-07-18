export const PLAN_TIERS = ["lite", "pro", "max", "universal"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const TIER_LABELS: Record<PlanTier, string> = { lite: "LITE", pro: "PRO", max: "MAX", universal: "Universal" };
export const TIER_COLORS: Record<PlanTier, string> = { lite: "bg-blue-500/20 text-blue-400", pro: "bg-emerald-500/20 text-emerald-400", max: "bg-amber-500/20 text-amber-400", universal: "bg-gray-500/20 text-gray-400" };
export const TIER_PRICES: Record<PlanTier, number> = { lite: 97, pro: 247, max: 797, universal: 0 };

export const SWIPE_CHANNELS = ["whatsapp", "email", "instagram", "voice", "chat_widget"] as const;
export type SwipeChannel = (typeof SWIPE_CHANNELS)[number];
export const CHANNEL_LABELS: Record<SwipeChannel, string> = { whatsapp: "WhatsApp", email: "E-mail", instagram: "Instagram", voice: "Voz", chat_widget: "Chat Widget" };

export const SWIPE_CATEGORIES = ["saudacao", "preco", "disponibilidade", "followup", "recuperacao", "upsell", "onboarding", "objecao", "encerramento", "promocao", "review", "recomendacao"] as const;
export type SwipeCategory = (typeof SWIPE_CATEGORIES)[number];
export const CATEGORY_LABELS: Record<SwipeCategory, string> = { saudacao: "Saudacao", preco: "Preco", disponibilidade: "Disponibilidade", followup: "Follow-up", recuperacao: "Recuperacao", upsell: "Upsell", onboarding: "Onboarding", objecao: "Objecao", encerramento: "Encerramento", promocao: "Promocao", review: "Review", recomendacao: "Recomendacao" };

export const SWIPE_TONES = ["concierge", "executivo", "casual", "urgente", "empatico"] as const;
export type SwipeTone = (typeof SWIPE_TONES)[number];

export interface SwipeTemplate {
  id: string;
  title: string;
  content: string;
  variables: string[];
  channel: SwipeChannel;
  category: SwipeCategory;
  tone: SwipeTone;
  tier: PlanTier;
  painType: string | null;
  tags: string[];
  timesUsed: number;
  conversions: number;
  convRate: number;
  lastUsedAt: Date | null;
  isAiGenerated: boolean;
  provenByConversion: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadProfile {
  id: string;
  email: string;
  pousada: string;
  score: number;
  cluster: string;
  dor: string | null;
  funilEstagio: string;
  qtdQuartos: number | null;
  regiao: string | null;
  uf: string | null;
  totalEventos: number;
  ultimosEventos: string[];
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

export interface SwipeUsage {
  id: string;
  swipeId: string;
  leadId: string;
  wasUsed: boolean;
  converted: boolean | null;
  agentId: string | null;
  responseTimeMs: number | null;
  feedback: "positivo" | "neutro" | "negativo" | null;
  createdAt: Date;
}

export interface SwipeStats {
  totalTemplates: number;
  totalUsages: number;
  totalConversions: number;
  avgConvRate: number;
  topByCategory: Record<SwipeCategory, SwipeTemplate>;
  topByChannel: Record<SwipeChannel, SwipeTemplate>;
  topByTier: Record<PlanTier, SwipeTemplate>;
  tierDistribution: Record<PlanTier, number>;
  channelDistribution: Record<SwipeChannel, number>;
  weeklyTrend: { week: string; usages: number; conversions: number }[];
}
