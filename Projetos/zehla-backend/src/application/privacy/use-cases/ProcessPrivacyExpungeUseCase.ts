import { Result } from '../../../shared/Result'
import { ICRMRepositoryPort } from '../../../domain/crm/ports/ICRMRepositoryPort'
import { IZaosMemoryPort } from '../../../domain/memory/IZaosMemoryPort'
import { PIIObfuscator } from '../../../domain/privacy/services/PIIObfuscator'
import { IPrivacyEventBusPort } from '../../../domain/privacy/ports/IPrivacyEventBusPort'
import { LeadProfile } from '../../../domain/crm/models/LeadProfile'

export class ProcessPrivacyExpungeUseCase {
  constructor(
    private readonly crmRepo: ICRMRepositoryPort,
    private readonly memoryPort: IZaosMemoryPort,
    private readonly obfuscator: PIIObfuscator,
    private readonly eventBus: IPrivacyEventBusPort,
  ) {}

  async execute(leadId: string, tenantId: string): Promise<Result<LeadProfile, Error>> {
    if (!leadId || leadId.trim().length === 0) {
      return Result.fail(new Error('ID do lead é obrigatório'))
    }
    if (!tenantId || tenantId.trim().length === 0) {
      return Result.fail(new Error('ID do tenant é obrigatório'))
    }

    // Passo 1: Localizar lead + validar tenant (RLS)
    const leadResult = await this.crmRepo.buscarLeadPorId(leadId)
    if (leadResult.isFail) {
      return Result.fail(new Error(`Lead não encontrado: ${leadResult.error.message}`))
    }
    const lead = leadResult.value!
    if (!lead) {
      return Result.fail(new Error('Lead não encontrado'))
    }
    if (lead.propriedadeId !== tenantId) {
      return Result.fail(new Error('Tenant mismatch: lead não pertence a esta pousada'))
    }

    // Passo 2: Deletar vetores do A-MEM (VectorDB)
    const memDelete = await this.memoryPort.deleteByLeadId(leadId, tenantId)
    if (memDelete.isFail) {
      return Result.fail(new Error(`Falha ao deletar memórias do A-MEM: ${memDelete.error!.message}`))
    }

    // Passo 3: Ofuscar PIIs (mantendo métricas financeiras intactas)
    const obfuscatedResult = this.obfuscator.obfuscate(lead)
    if (obfuscatedResult.isFail) {
      return Result.fail(new Error(`Falha na ofuscação PII: ${obfuscatedResult.error.message}`))
    }
    const obfuscated = obfuscatedResult.value!

    const savedResult = await this.crmRepo.atualizarLead(obfuscated)
    if (savedResult.isFail) {
      return Result.fail(new Error(`Falha ao salvar lead ofuscado: ${savedResult.error.message}`))
    }

    // Passo 4: Emitir evento de trilha de auditoria
    const operationHash = this._generateOperationHash(leadId, tenantId)
    await this.eventBus.publishExpungeCompleted({
      leadId,
      tenantId,
      occurredAt: new Date(),
      operationHash,
    })

    return Result.ok(obfuscated)
  }

  private _generateOperationHash(leadId: string, tenantId: string): string {
    const raw = `${leadId}:${tenantId}:${Date.now()}`
    let hash = 0
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash |= 0
    }
    return `EXPUNGE_${Math.abs(hash).toString(16).padStart(8, '0')}`
  }
}
