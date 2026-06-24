// Shared types — migrated from zcc-mock-data

export type LeadStatus = 'pending' | 'verified' | 'contacted' | 'converted' | 'inactive';
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';
export type CampaignType = 'whatsapp' | 'email' | 'ads';
export type TargetStatus = 'active' | 'pending' | 'inactive';

export interface Lead {
  id: string;
  empresa: string;
  decisor: string;
  cargo: string;
  email: string;
  whatsapp: string;
  porte: 'pequeno' | 'médio' | 'grande' | 'luxo';
  score: number;
  status: LeadStatus;
  targetId?: string;
  idpScore?: number;
  receitaAtual?: number;
  endereco?: string;
  site?: string;
  redesSociais?: string[];
  observacoes?: string;
  ultimoContato?: Date;
  createdAt: Date;

  // Diagnose/report fields
  whatsappScript?: string;
  gapPercent?: number;
  diariaMedia?: number;
  ocupacaoMedia?: number;
  receitaPotencial?: number;
  auditText?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  type: CampaignType;
  targetId: string;
  leads: number;
  sent: number;
  replied: number;
  converted: number;
  budget: number;
  description?: string;
  createdAt: Date;
}

export interface Target {
  id: string;
  name: string;
  description: string;
  status: TargetStatus;
  leads: number;
  converted: number;
  tags: string[];
  createdAt: Date;
}
