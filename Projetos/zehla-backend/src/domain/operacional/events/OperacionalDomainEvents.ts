import { DomainEvent } from '../../shared/DomainEvent'

export function createDomainEvent(
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

export function TarefaCriadaEvent(tarefaId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(tarefaId, 'TarefaCriadaEvent', payload)
}

export function TarefaIniciadaEvent(tarefaId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(tarefaId, 'TarefaIniciadaEvent', payload)
}

export function TarefaConcluidaEvent(tarefaId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(tarefaId, 'TarefaConcluidaEvent', payload)
}

export function TarefaAtrasadaEvent(tarefaId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(tarefaId, 'TarefaAtrasadaEvent', payload)
}

export function ManutencaoAbertaEvent(manutencaoId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(manutencaoId, 'ManutencaoAbertaEvent', payload)
}

export function ManutencaoIniciadaEvent(manutencaoId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(manutencaoId, 'ManutencaoIniciadaEvent', payload)
}

export function ManutencaoConcluidaEvent(manutencaoId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(manutencaoId, 'ManutencaoConcluidaEvent', payload)
}

export function ManutencaoCanceladaEvent(manutencaoId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(manutencaoId, 'ManutencaoCanceladaEvent', payload)
}

export function ChecklistCriadoEvent(checklistId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(checklistId, 'ChecklistCriadoEvent', payload)
}

export function ChecklistConcluidoEvent(checklistId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(checklistId, 'ChecklistConcluidoEvent', payload)
}

export function FornecedorCadastradoEvent(fornecedorId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(fornecedorId, 'FornecedorCadastradoEvent', payload)
}

export function FornecedorSuspensoEvent(fornecedorId: string, payload: Record<string, unknown>): DomainEvent {
  return createDomainEvent(fornecedorId, 'FornecedorSuspensoEvent', payload)
}
