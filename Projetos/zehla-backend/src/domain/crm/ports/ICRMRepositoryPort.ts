import { CRMPipelineStage } from '../models/CRMPipelineStage'
import { LeadProfile } from '../models/LeadProfile'
import { InteractionRecord } from '../models/InteractionRecord'
import { Result } from '../../../shared/Result'

export interface ICRMRepositoryPort {
  salvarLead(lead: LeadProfile): Promise<Result<LeadProfile, Error>>
  buscarLeadPorId(id: string): Promise<Result<LeadProfile | null, Error>>
  buscarLeadPorTelefone(telefone: string): Promise<Result<LeadProfile | null, Error>>
  listarLeadsPorStage(stage: CRMPipelineStage): Promise<Result<LeadProfile[], Error>>
  registrarInteracao(record: InteractionRecord): Promise<Result<InteractionRecord, Error>>
  listarInteracoesPorLead(leadId: string): Promise<Result<InteractionRecord[], Error>>
  atualizarStage(leadId: string, stage: CRMPipelineStage): Promise<Result<LeadProfile, Error>>
}
