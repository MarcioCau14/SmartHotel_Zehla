import { LeadStatus as LeadDomainStatus } from '../../../domain/comercial/entities/Lead'

export type KanbanColumnStatus = 'novo' | 'qualificado' | 'trial' | 'propostado' | 'convertido' | 'perdido'

const DOMAIN_TO_UI_MAP: Record<LeadDomainStatus, KanbanColumnStatus> = {
  prospect: 'novo',
  qualified: 'qualificado',
  trial: 'trial',
  negotiation: 'propostado',
  converted: 'convertido',
  churned: 'perdido',
  reactivated: 'novo' // leads reativados iniciam na primeira raia
}

const UI_TO_DOMAIN_MAP: Record<KanbanColumnStatus, LeadDomainStatus> = {
  novo: 'prospect',
  qualificado: 'qualified',
  trial: 'trial',
  propostado: 'negotiation',
  convertido: 'converted',
  perdido: 'churned'
}

export function mapStatusToKanban(domainStatus: LeadDomainStatus): KanbanColumnStatus {
  return DOMAIN_TO_UI_MAP[domainStatus] || 'novo'
}

export function mapKanbanToDomain(uiStatus: KanbanColumnStatus): LeadDomainStatus {
  return UI_TO_DOMAIN_MAP[uiStatus] || 'prospect'
}
