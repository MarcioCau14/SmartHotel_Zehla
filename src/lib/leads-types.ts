// =============================================================================
// ZEHLA SmartHotel — Tipos do Sistema de Prospecção de Leads (Lessie AI)
// =============================================================================

/** Lead identificado pela Lessie AI durante a caça prospectiva */
export interface Lead {
  id: string;
  empresa: string;
  decisor: string;
  cargo: string;
  email: string;
  whatsapp: string;
  setor: string;
  socialMedia: Record<string, string>;
  porte: 'pequeno' | 'medio' | 'grande';
  status: 'pending' | 'verified' | 'contacted' | 'converted' | 'lost';
  hook: string;
  validationScore: number;
  socialFootprint: Record<string, unknown>;
  metadata: Record<string, unknown>;
  targetId: string | null;
  createdAt: string;
  updatedAt: string;
  /** @deprecated — legado snake_case para compat com Secretaria UI */
  validation_score?: number;
  /** @deprecated — legado snake_case para compat com Secretaria UI */
  social_footprint?: Record<string, string>;
  /** @deprecated — dados Revenue Manager (Secretaria UI) */
  rm_data?: {
    idp: number;
    gap: string;
    diagnostico: string;
    pitch: string;
    preco_base?: string;
  };
}

/** Alvo de prospecção — pousada / hotel independente mapeado */
export interface Target {
  id: string;
  name: string;
  domain: string;
  website: string | null;
  city: string;
  state: string;
  status: 'active' | 'pending' | 'inactive' | 'prospected';
  priority: number;
  createdAt: string;
  updatedAt: string;
}

/** Template de mensagem para Swipe (WhatsApp / Email) */
export interface SwipeTemplate {
  id: string;
  name: string;
  category: 'prospecção' | 'follow-up' | 'conversão' | 'reativação';
  content: string;
  variables: string[];
  successRate: number;
  usageCount: number;
  isActive: boolean;
}

/** Campanha de outreach (WhatsApp, Email, Ads ou Multi-canal) */
export interface Campaign {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'ads' | 'multi';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetAudience: string;
  messageTemplate: string;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalReplied: number;
}

/** Registro de execução de um agente Lessie */
export interface AgentLog {
  id: string;
  agentId: string;
  action: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number;
  status: string;
  errorMsg: string;
  createdAt: string;
}

/** Provider de modelo no ZaosNeuroRouter com circuit breaker */
export interface RouterProvider {
  id: string;
  provider: string;
  modelName: string;
  tier: string;
  alpha: number;
  beta: number;
  circuitStatus: 'closed' | 'half_open' | 'open';
  lastFailureAt: string | null;
  failureCount: number;
  successCount: number;
  avgLatencyMs: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  isActive: boolean;
  supportsJson: boolean;
  supportsTools: boolean;
}

/** Estado atual do Budget Guard (guardião de orçamento) */
export interface BudgetGuardState {
  id: string;
  date: string;
  dailySpendUsd: number;
  dailyBudgetUsd: number;
  monthlySpendUsd: number;
  monthlyBudgetUsd: number;
  criticalLevel: 'nominal' | 'warning' | 'critical';
}

/** Diagnóstico de receita gerado pela Lessie para um lead */
export interface RevenueDiagnosis {
  hotelName: string;
  idp: number; // 0-100 Índice de Desempenho de Preços
  priceGap: 'CRITICAL' | 'WARNING' | 'OPTIMAL';
  gapDescription: string;
  auditReport: string;
  whatsappScript: string;
  estimatedMonthlyRevenue: number;
  potentialRevenue: number;
  revenueLossPercent: number;
}

/** Evento de progresso da caça (hunt) em tempo real */
export interface HuntProgress {
  event: string;
  message: string;
  timestamp: number;
  progress: number; // 0-100
}

/** Filtros disponíveis para consulta de leads */
export type LeadFilter = {
  status?: string;
  minScore?: number;
  company?: string;
  search?: string;
};

// ── ZCC Types (migrated from zcc-mock-data) ──

export type ZccCampaignStatus = 'active' | 'paused' | 'completed' | 'draft';
export type ZccCampaignType = 'whatsapp' | 'email' | 'ads';
export type ZccTargetStatus = 'active' | 'pending' | 'inactive';

export interface ZccTarget {
  id: string;
  name: string;
  domain: string;
  city: string;
  state: string;
  priority: number;
  status: ZccTargetStatus;
  leadCount: number;
}

export interface ZccCampaign {
  id: string;
  name: string;
  type: ZccCampaignType;
  status: ZccCampaignStatus;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  total: number;
  createdAt: string;
  template: string;
}

export interface DashboardStats {
  totalLeads: number;
  verifiedLeads: number;
  messagesSent: number;
  activeCampaigns: number;
  conversionRate: string;
  monthlyAICost: number;
}