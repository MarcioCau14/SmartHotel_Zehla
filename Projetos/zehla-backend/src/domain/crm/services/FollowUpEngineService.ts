import { Result } from '../../../shared/Result'
import { CRMPipelineStage } from '../models/CRMPipelineStage'
import { LeadProfile } from '../models/LeadProfile'
import { InteractionRecord } from '../models/InteractionRecord'
import { CadenceClock } from '../models/CadenceClock'
import { FollowUpAction } from '../models/FollowUpAction'

export interface FollowUpEngineInput {
  lead: LeadProfile
  interactions: InteractionRecord[]
  currentDate: Date
}

export class FollowUpEngineService {
  execute(input: FollowUpEngineInput): Result<FollowUpAction | null, Error> {
    const { lead, interactions, currentDate } = input

    const stagesQueGeramFollowUp: CRMPipelineStage[] = [
      CRMPipelineStage.QUALIFICACAO,
      CRMPipelineStage.PROPOSTA,
    ]

    if (!stagesQueGeramFollowUp.includes(lead.stage)) {
      return Result.ok(null)
    }

    const interacoesOrdenadas = [...interactions]
      .filter(i => i.leadId === lead.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    if (interacoesOrdenadas.length === 0) {
      return Result.ok(null)
    }

    const ultimaInteracao = interacoesOrdenadas[0]

    if (ultimaInteracao.outcome === 'CONVERTED') {
      return Result.ok(null)
    }

    const ultimaDoLead = interacoesOrdenadas.find(i => i.outcome === 'PENDING')
    const referencia = ultimaDoLead ?? ultimaInteracao

    const clockResult = CadenceClock.create({
      lastInteractionAt: referencia.timestamp,
      currentDate,
    })

    if (clockResult.isFail) {
      return Result.fail(clockResult.error)
    }

    const clock = clockResult.value

    if (!clock.hasTriggered()) {
      return Result.ok(null)
    }

    const actionResult = FollowUpAction.create({
      leadId: lead.id,
      scheduleType: clock.mostAdvancedCadence!,
    })

    if (actionResult.isFail) {
      return Result.fail(actionResult.error)
    }

    return Result.ok(actionResult.value)
  }
}
