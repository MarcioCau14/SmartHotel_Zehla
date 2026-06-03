import { Result } from '../../../shared/Result'
import { ICRMRepositoryPort } from '../../../domain/crm/ports/ICRMRepositoryPort'
import { ILMProviderPort } from '../../../domain/crm/ports/ILMProviderPort'
import { IWhatsAppPort } from '../../shared/ports/IWhatsAppPort'
import { GenerateFollowUpSignature } from '../../../domain/crm/cognitive/GenerateFollowUpSignature'
import { FollowUpCadence } from '../../../domain/crm/models/FollowUpSchedule'
import { CRMPipelineStage } from '../../../domain/crm/models/CRMPipelineStage'
import { InteractionRecord } from '../../../domain/crm/models/InteractionRecord'

export interface ProcessFollowUpInput {
  leadId: string
  scheduleType: FollowUpCadence
}

export interface ProcessFollowUpOutput {
  messageSent: boolean
  leadId: string
  cadence: FollowUpCadence
}

export class ProcessFollowUpUseCase {
  constructor(
    private readonly leadRepo: ICRMRepositoryPort,
    private readonly llmProvider: ILMProviderPort,
    private readonly whatsApp: IWhatsAppPort,
  ) {}

  async execute(input: ProcessFollowUpInput): Promise<Result<ProcessFollowUpOutput, Error>> {
    const leadResult = await this.leadRepo.buscarLeadPorId(input.leadId)
    if (leadResult.isFail) {
      return Result.fail(leadResult.error)
    }

    const lead = leadResult.value
    if (!lead) {
      return Result.fail(new Error('LEAD_NAO_ENCONTRADO'))
    }

    if (lead.stage === CRMPipelineStage.FECHAMENTO) {
      return Result.ok({ messageSent: false, leadId: lead.id, cadence: input.scheduleType })
    }

    const interacoesResult = await this.leadRepo.listarInteracoesPorLead(lead.id)
    if (interacoesResult.isFail) {
      return Result.fail(interacoesResult.error)
    }

    const ultimoResumo = interacoesResult.value.length > 0
      ? interacoesResult.value[interacoesResult.value.length - 1].resumo ?? 'Nenhuma interação anterior'
      : 'Lead novo, sem interações prévias'

    const signature = new GenerateFollowUpSignature({
      leadName: lead.nome,
      leadStage: lead.stage,
      scheduleType: input.scheduleType,
      lastInteractionSummary: ultimoResumo,
    })

    const prompt = signature.buildFullPrompt()

    const llmResult = await this.llmProvider.generate({
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      temperature: 0.7,
    })

    if (llmResult.isFail) {
      return Result.fail(new Error(`LLM_FALHA: ${llmResult.error.message}`))
    }

    const mensagem = llmResult.value

    const whatsResult = await this.whatsApp.sendText({
      to: lead.telefone,
      content: mensagem,
    })

    if (!whatsResult.success) {
      return Result.fail(new Error(`WHATSAPP_FALHA: ${whatsResult.error ?? 'erro desconhecido'}`))
    }

    const interactionResult = InteractionRecord.create({
      id: `followup_${lead.id}_${Date.now()}`,
      leadId: lead.id,
      canal: 'whatsapp',
      timestamp: new Date(),
      sentimentScore: 0,
      tokenCost: 0,
      outcome: 'PENDING',
      resumo: `Follow-up ${input.scheduleType} enviado via IA: ${mensagem.slice(0, 100)}...`,
    })

    if (interactionResult.isFail) {
      return Result.fail(interactionResult.error)
    }

    await this.leadRepo.registrarInteracao(interactionResult.value)

    return Result.ok({
      messageSent: true,
      leadId: lead.id,
      cadence: input.scheduleType,
    })
  }
}
