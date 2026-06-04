import { Result } from '../../../shared/Result'
import { ICRMRepositoryPort } from '../../../domain/crm/ports/ICRMRepositoryPort'
import { CRMPipelineStage } from '../../../domain/crm/models/CRMPipelineStage'

export class UpdateLeadStageUseCase {
  constructor(private readonly repo: ICRMRepositoryPort) {}

  async execute(leadId: string, newStage: string, propertyId: string): Promise<Result<{ id: string; stage: string }, Error>> {
    const stageKey = newStage.toUpperCase() as CRMPipelineStage
    if (!Object.values(CRMPipelineStage).includes(stageKey)) {
      return Result.fail(new Error(`Estágio inválido: ${newStage}`))
    }

    const leadResult = await this.repo.buscarLeadPorId(leadId)
    if (leadResult.isFail) return Result.fail(leadResult.error)
    if (!leadResult.value) return Result.fail(new Error('Lead não encontrado'))

    if (leadResult.value.propriedadeId !== propertyId) {
      return Result.fail(new Error('Acesso negado a este lead'))
    }

    const result = await this.repo.atualizarStage(leadId, stageKey)
    if (result.isFail) return Result.fail(result.error)

    return Result.ok(Object.freeze({ id: leadId, stage: stageKey }))
  }
}
