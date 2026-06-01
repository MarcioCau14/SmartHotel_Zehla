import { Result } from '../../../shared/Result'
import { IComercialLeadPort } from '../ports/IComercialLeadPort'
import { ComercialLead } from '../../../domain/comercial/entities/ComercialLead'
import { SummaryPackage } from '../../../domain/comercial/events/ComercialDomainEvents'
import { DomainEventPublisher } from '../../../domain/shared/events/DomainEventPublisher'

export interface RealizarHandoffInput {
  leadId: string
  closerId: string
  summaryPackage: SummaryPackage
}

export class RealizarHandoffUseCase {
  constructor(
    private readonly leadPort: IComercialLeadPort,
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(input: RealizarHandoffInput): Promise<Result<ComercialLead, Error>> {
    const busca = await this.leadPort.buscarPorId(input.leadId)
    if (busca.isFail) {
      return Result.fail(busca.error)
    }
    const lead = busca.value
    if (!lead) {
      return Result.fail(new Error('LEAD_NAO_ENCONTRADO'))
    }

    const handoff = lead.realizarHandoff(input.closerId, input.summaryPackage)
    if (handoff.isFail) {
      return Result.fail(handoff.error)
    }

    const salvo = await this.leadPort.salvar(handoff.value)
    if (salvo.isFail) {
      return Result.fail(salvo.error)
    }

    const events = salvo.value.getDomainEvents()
    this.publisher.publishAll(events)
    salvo.value.clearEvents()

    return salvo
  }
}
