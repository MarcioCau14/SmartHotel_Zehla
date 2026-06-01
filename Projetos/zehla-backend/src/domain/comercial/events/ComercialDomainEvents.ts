import { DomainEvent } from '../../shared/DomainEvent'

function criarEvento(
  aggregateId: string,
  eventName: string,
  payload: Record<string, unknown>,
): DomainEvent {
  return {
    aggregateId,
    eventName,
    occurredAt: new Date(),
    payload,
  }
}

// --- Captura e Primeira Interação ---
export function LeadCapturadoEvent(leadId: string, payload: {
  nome?: string
  email?: string
  canal: string
  score: number
  icpFit: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadCapturadoEvent', payload as unknown as Record<string, unknown>)
}

export function LeadPrimeiraInteracaoEvent(leadId: string, payload: {
  canal: string
  mensagemTipo: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadPrimeiraInteracaoEvent', payload as unknown as Record<string, unknown>)
}

export function LeadFollowUpRealizadoEvent(leadId: string, payload: {
  numeroFollowUp: number
  canal: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadFollowUpRealizadoEvent', payload as unknown as Record<string, unknown>)
}

// --- Qualificação ---
export function LeadQualificadoEvent(leadId: string, payload: {
  score: number
  icpFit: string
  bantBudget: boolean
  bantAuthority: boolean
  bantNeed: boolean
  bantTimeline: boolean
}): DomainEvent {
  return criarEvento(leadId, 'LeadQualificadoEvent', payload as unknown as Record<string, unknown>)
}

// --- Agendamento ---
export function LeadAgendadoEvent(leadId: string, payload: {
  dataAgendamento: string
  closerId?: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadAgendadoEvent', payload as unknown as Record<string, unknown>)
}

export function LeadNoShowEvent(leadId: string, payload: {
  dataAgendamentoOriginal: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadNoShowEvent', payload as unknown as Record<string, unknown>)
}

export function LeadReagendadoEvent(leadId: string, payload: {
  dataAgendamentoOriginal: string
  dataAgendamentoNovo: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadReagendadoEvent', payload as unknown as Record<string, unknown>)
}

// --- Handoff ---
export interface SummaryPackage {
  score: number
  icpFit: string
  interacoes: number
  objecoes: string[]
  respostas: string[]
  ultimoEstado: string
  gatilho?: string
}

export function LeadHandoffParaCloserEvent(leadId: string, payload: {
  closerId: string
  summaryPackage: SummaryPackage
  gatilho: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadHandoffParaCloserEvent', payload as unknown as Record<string, unknown>)
}

// --- Negociação e Venda ---
export function LeadEmNegociacaoEvent(leadId: string, payload: {
  closerId: string
  propostaId?: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadEmNegociacaoEvent', payload as unknown as Record<string, unknown>)
}

export function LeadVendaSinalEvent(leadId: string, payload: {
  propostaId: string
  valorSinal: number
  plano: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadVendaSinalEvent', payload as unknown as Record<string, unknown>)
}

export function LeadVendaConcluidaEvent(leadId: string, payload: {
  conversaoId: string
  valorTotal: number
  plano: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadVendaConcluidaEvent', payload as unknown as Record<string, unknown>)
}

// --- Perda e Reativação ---
export function LeadPerdidoEvent(leadId: string, payload: {
  motivo?: string
  diasNoFunil: number
  ultimoEstado: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadPerdidoEvent', payload as unknown as Record<string, unknown>)
}

export function LeadReativadoEvent(leadId: string, payload: {
  motivoReativacao?: string
  diasPerdido: number
}): DomainEvent {
  return criarEvento(leadId, 'LeadReativadoEvent', payload as unknown as Record<string, unknown>)
}

// --- Pós-Vendas ---
export function LeadOnboardingIniciadoEvent(leadId: string, payload: {
  plano: string
  dataInicio: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadOnboardingIniciadoEvent', payload as unknown as Record<string, unknown>)
}

export function LeadRenovacaoProximaEvent(leadId: string, payload: {
  planoAtual: string
  diasParaVencimento: number
}): DomainEvent {
  return criarEvento(leadId, 'LeadRenovacaoProximaEvent', payload as unknown as Record<string, unknown>)
}

// --- Repescagem ---
export function LeadSalesFarmingEvent(leadId: string, payload: {
  diasDesdeUltimaInteracao: number
  ultimoEstado: string
}): DomainEvent {
  return criarEvento(leadId, 'LeadSalesFarmingEvent', payload as unknown as Record<string, unknown>)
}
