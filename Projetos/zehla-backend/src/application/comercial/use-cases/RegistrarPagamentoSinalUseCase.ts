import { Result } from '../../../shared/Result'
import { IComercialLeadPort } from '../ports/IComercialLeadPort'
import { ComercialLead } from '../../../domain/comercial/entities/ComercialLead'
import { DomainEventPublisher } from '../../../domain/shared/events/DomainEventPublisher'

export interface RegistrarPagamentoSinalInput {
  leadId: string
  propostaId: string
  valorSinal: number
  plano: string
}

export class RegistrarPagamentoSinalUseCase {
  constructor(
    private readonly leadPort: IComercialLeadPort,
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(input: RegistrarPagamentoSinalInput): Promise<Result<ComercialLead, Error>> {
    const busca = await this.leadPort.buscarPorId(input.leadId)
    if (busca.isFail) return Result.fail(busca.error)
    const lead = busca.value
    if (!lead) return Result.fail(new Error('LEAD_NAO_ENCONTRADO'))

    const sinal = lead.fecharVendaSinal(input.propostaId, input.valorSinal, input.plano)
    if (sinal.isFail) return Result.fail(sinal.error)

    const salvo = await this.leadPort.salvar(sinal.value)
    if (salvo.isFail) return Result.fail(salvo.error)

    const events = salvo.value.getDomainEvents()
    this.publisher.publishAll(events)
    salvo.value.clearEvents()

    return salvo
  }
}
