import { CRMPipelineStage } from '../../../domain/crm/models/CRMPipelineStage'
import { LeadProfile } from '../../../domain/crm/models/LeadProfile'
import { InteractionRecord } from '../../../domain/crm/models/InteractionRecord'
import { ICRMRepositoryPort } from '../../../domain/crm/ports/ICRMRepositoryPort'
import { Result } from '../../../shared/Result'

export class InMemoryCRMAdapter implements ICRMRepositoryPort {
  private leads: Map<string, LeadProfile> = new Map()
  private interacoes: Map<string, InteractionRecord[]> = new Map()

  async salvarLead(lead: LeadProfile): Promise<Result<LeadProfile, Error>> {
    this.leads.set(lead.id, lead)
    return Result.ok(lead)
  }

  async buscarLeadPorId(id: string): Promise<Result<LeadProfile | null, Error>> {
    const lead = this.leads.get(id) ?? null
    return Result.ok(lead)
  }

  async buscarLeadPorTelefone(telefone: string): Promise<Result<LeadProfile | null, Error>> {
    for (const lead of this.leads.values()) {
      if (lead.telefone === telefone) return Result.ok(lead)
    }
    return Result.ok(null)
  }

  async listarLeadsPorStage(stage: CRMPipelineStage): Promise<Result<LeadProfile[], Error>> {
    const filtrados = Array.from(this.leads.values()).filter((l) => l.stage === stage)
    return Result.ok(filtrados)
  }

  async registrarInteracao(record: InteractionRecord): Promise<Result<InteractionRecord, Error>> {
    const existentes = this.interacoes.get(record.leadId) ?? []
    existentes.push(record)
    this.interacoes.set(record.leadId, existentes)
    return Result.ok(record)
  }

  async listarInteracoesPorLead(leadId: string): Promise<Result<InteractionRecord[], Error>> {
    return Result.ok(this.interacoes.get(leadId) ?? [])
  }

  async atualizarStage(leadId: string, stage: CRMPipelineStage): Promise<Result<LeadProfile, Error>> {
    const lead = this.leads.get(leadId)
    if (!lead) {
      return Result.fail(new Error(`Lead ${leadId} não encontrado`))
    }
    const atualizado = lead.withStage(stage)
    if (atualizado.isFail) return atualizado
    this.leads.set(leadId, atualizado.value)
    return Result.ok(atualizado.value)
  }

  async atualizarLead(lead: LeadProfile): Promise<Result<LeadProfile, Error>> {
    if (!this.leads.has(lead.id)) {
      return Result.fail(new Error(`Lead ${lead.id} não encontrado`))
    }
    this.leads.set(lead.id, lead)
    return Result.ok(lead)
  }

  async buscarLeadPorPropriedade(propriedadeId: string): Promise<Result<LeadProfile | null, Error>> {
    for (const lead of this.leads.values()) {
      if (lead.propriedadeId === propriedadeId) return Result.ok(lead)
    }
    return Result.ok(null)
  }

  reset(): void {
    this.leads.clear()
    this.interacoes.clear()
  }
}
