import { Result } from '../../../shared/Result'
import { ILeadPort } from '../ports/ILeadPort'
import { Lead } from '../../../domain/comercial/entities/Lead'
import { Score } from '../../../domain/comercial/value-objects/Score'

export interface AtualizarStatusEntregaInput {
  leadId: string
  propriedadeId: string
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
}

export class AtualizarStatusEntregaUseCase {
  constructor(private readonly leadPort: ILeadPort) {}

  async execute(input: AtualizarStatusEntregaInput): Promise<Result<Lead, Error>> {
    const { leadId, propriedadeId, status } = input

    const leadResult = await this.leadPort.buscarLeadPorId(leadId, propriedadeId)
    if (leadResult.isFail) {
      return Result.fail(leadResult.error)
    }

    const lead = leadResult.value
    if (!lead) {
      return Result.fail(new Error('Lead not found'))
    }

    let updatedLead = lead
    const currentScore = lead.score ? lead.score.value : 0

    if (status === 'READ') {
      const newScoreVal = Math.min(100, currentScore + 10)
      const scoreResult = Score.criar(newScoreVal)
      if (scoreResult.isFail) return Result.fail(scoreResult.error)

      if (lead.status === 'prospect' && scoreResult.value.isQualificado()) {
        const qualResult = lead.qualificar()
        if (qualResult.isFail) return Result.fail(qualResult.error)
        updatedLead = qualResult.value
      }
    } else if (status === 'FAILED') {
      const newScoreVal = Math.max(0, currentScore - 5)
      const scoreResult = Score.criar(newScoreVal)
      if (scoreResult.isFail) return Result.fail(scoreResult.error)
    }

    const updateResult = await this.leadPort.atualizarLead(leadId, propriedadeId, {
      score: updatedLead.score?.value,
      status: updatedLead.status,
    })

    if (updateResult.isFail) {
      return Result.fail(updateResult.error)
    }

    return Result.ok(updateResult.value)
  }
}
