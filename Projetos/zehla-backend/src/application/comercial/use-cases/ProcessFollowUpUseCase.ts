import { Result } from '../../../shared/Result'
import { IComercialLeadPort } from '../ports/IComercialLeadPort'
import { IMessagingGateway } from '../../../domain/marketing/ports/IMessagingGateway'
import { DomainEventPublisher } from '../../../domain/shared/events/DomainEventPublisher'

export interface ProcessFollowUpInput {
  leadId: string
  cadenceType: 'ENGAJAMENTO' | 'URGENCIA' | 'FECHAMENTO'
  roiData?: {
    score: number
    category: string
    lgpdRisk: string
    playbookUrl: string
  }
}

export class ProcessFollowUpUseCase {
  constructor(
    private readonly leadPort: IComercialLeadPort,
    private readonly messagingGateway: IMessagingGateway,
    private readonly publisher?: DomainEventPublisher
  ) {}

  async execute(input: ProcessFollowUpInput): Promise<Result<void, Error>> {
    const busca = await this.leadPort.buscarPorId(input.leadId)
    if (busca.isFail) {
      return Result.fail(busca.error)
    }
    const lead = busca.value
    if (!lead) {
      return Result.fail(new Error('LEAD_NAO_ENCONTRADO'))
    }

    if (!lead.telefone) {
      return Result.fail(new Error('LEAD_SEM_TELEFONE'))
    }

    let messageContent = ''

    if (input.cadenceType === 'ENGAJAMENTO' && input.roiData) {
      const nome = lead.nome || 'Parceiro'
      const { score, category, playbookUrl } = input.roiData
      
      messageContent = `Olá ${nome}! Analisamos o perfil da sua propriedade e geramos o seu Playbook de Prontidão IA. ` +
        `Seu score de maturidade é ${score}/100 (Categoria: ${category}). ` +
        `Acesse o seu diagnóstico completo e estimativa de ROI aqui: ${playbookUrl}`
    } else {
      const nome = lead.nome || 'Parceiro'
      messageContent = `Olá ${nome}, gostaríamos de dar continuidade ao nosso contato. Como estão as coisas por aí?`
    }

    const sendResult = await this.messagingGateway.sendText(lead.telefone, messageContent)
    if (sendResult.isFail) {
      return Result.fail(sendResult.error)
    }

    const followUpResult = lead.realizarFollowUp()
    if (followUpResult.isFail) {
      return Result.fail(followUpResult.error)
    }

    const salvo = await this.leadPort.salvar(followUpResult.value)
    if (salvo.isFail) {
      return Result.fail(salvo.error)
    }

    if (this.publisher) {
      const events = salvo.value.getDomainEvents()
      this.publisher.publishAll(events)
      salvo.value.clearEvents()
    }

    return Result.ok(undefined)
  }
}
