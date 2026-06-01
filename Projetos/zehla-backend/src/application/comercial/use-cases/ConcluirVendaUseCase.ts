import { Result } from '../../../shared/Result'
import { IComercialLeadPort } from '../ports/IComercialLeadPort'
import { ComercialLead } from '../../../domain/comercial/entities/ComercialLead'
import { DomainEventPublisher } from '../../../domain/shared/events/DomainEventPublisher'

export class ConcluirVendaUseCase {
  constructor(
    private readonly leadPort: IComercialLeadPort,
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(leadId: string): Promise<Result<ComercialLead, Error>> {
    const busca = await this.leadPort.buscarPorId(leadId)
    if (busca.isFail) return Result.fail(busca.error)
    const lead = busca.value
    if (!lead) return Result.fail(new Error('LEAD_NAO_ENCONTRADO'))

    const conclusao = lead.concluirVenda()
    if (conclusao.isFail) return Result.fail(conclusao.error)

    const salvo = await this.leadPort.salvar(conclusao.value)
    if (salvo.isFail) return Result.fail(salvo.error)

    const events = salvo.value.getDomainEvents()
    this.publisher.publishAll(events)
    salvo.value.clearEvents()

    return salvo
  }
}
