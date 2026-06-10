import { Result } from '../../../shared/Result'
import { ILeadPort } from '../ports/ILeadPort'
import { Lead } from '../../../domain/comercial/entities/Lead'

export interface AtualizarStatusEntregaInput {
  leadId: string
  propriedadeId: string
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
}

export class AtualizarStatusEntregaUseCase {
  constructor(private readonly leadPort: ILeadPort) {}

  async execute(input: AtualizarStatusEntregaInput): Promise<Result<Lead, Error>> {
    const { leadId, propiedadId } = input as any
    const propriedadeId = propiedadId || input.propriedadeId
    const { status } = input

    const leadResult = await this.leadPort.buscarLeadPorId(leadId, propriedadeId)
    if (leadResult.isFail) {
      return Result.fail(leadResult.error)
    }

    const lead = leadResult.value
    if (!lead) {
      return Result.fail(new Error('Lead not found'))
    }

    let newScore = lead.score ? lead.score.value : 0
    let newStatus = lead.status

    if (status === 'READ') {
      // Se lido, aumenta o score em 10 pontos
      newScore = Math.min(100, newScore + 10)
      
      // Se o status for 'prospect' e o score for suficiente, promove na FSM
      if (lead.status === 'prospect' && newScore >= 30) {
        newStatus = 'qualified'
      }
    } else if (status === 'FAILED') {
      // Se falhou, reduz o score
      newScore = Math.max(0, newScore - 5)
    }

    const updateResult = await this.leadPort.atualizarLead(leadId, propriedadeId, {
      score: newScore,
      status: newStatus
    })

    if (updateResult.isFail) {
      return Result.fail(updateResult.error)
    }

    return Result.ok(updateResult.value)
  }
}
