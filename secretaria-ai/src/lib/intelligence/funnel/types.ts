// src/lib/intelligence/funnel/types.ts

export type PainCluster = 'financeira' | 'operacional' | 'ocupacao' | 'desconhecida';
export type FunnelCluster = 'HOT' | 'WARM' | 'COLD';
export type FunnelTier = 'MAX' | 'PRO' | 'LITE';

export type EventType =
  | 'email_sent'
  | 'email_opened'
  | 'email_clicked'
  | 'email_bounced'
  | 'whatsapp_sent'
  | 'whatsapp_delivered'
  | 'whatsapp_replied'
  | 'whatsapp_read'
  | 'lp_visited'
  | 'lp_cta_clicked'
  | 'ray-x_requested'
  | 'ray-x_delivered'
  | 'trial_started'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'referral_made'
  | 'nps_submitted'
  | 'churn_risk'
  | 'upgrade_detected';

export interface FunnelEventInput {
  leadId: string;
  campaignId?: string;
  type: EventType;
  painCluster?: PainCluster;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface FunnelScoreUpdate {
  totalScore: number;
  engagementScore: number;
  intentScore: number;
  fitScore: number;
  cluster: FunnelCluster;
  painCluster?: PainCluster;
}

export interface NextAction {
  action: string;
  channel: 'email' | 'whatsapp' | 'ads' | 'none';
  priority: 'high' | 'medium' | 'low';
  template?: string;
  delay?: number; // minutes
  reason: string;
}

export interface LeadFunnelProfile {
  leadId: string;
  cluster: FunnelCluster;
  previousCluster?: string;
  painCluster: PainCluster;
  totalScore: number;
  tier: FunnelTier;
  lastInteraction?: Date;
  eventCount: number;
  nextAction: NextAction;
}
