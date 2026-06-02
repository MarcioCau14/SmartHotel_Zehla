import { Result } from '../../../shared/Result'
import { IComercialLeadPort } from '../ports/IComercialLeadPort'
import { ComercialLead } from '../../../domain/comercial/entities/ComercialLead'
import { DomainEventPublisher } from '../../../domain/shared/events/DomainEventPublisher'
import { createLogger } from '../../../infrastructure/observability/Logger'
import { getTraceId, getTenantId } from '../../../infrastructure/observability/RequestLogger'

export class QualificarLeadUseCase {
  constructor(
    private readonly leadPort: IComercialLeadPort,
    private readonly publisher: DomainEventPublisher,
  ) {}

  private readonly log = createLogger()

  async execute(leadId: string): Promise<Result<ComercialLead, Error>> {
    const busca = await this.leadPort.buscarPorId(leadId)
    if (busca.isFail) {
      this.log.warn({ error: busca.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao buscar lead por ID')
      return Result.fail(busca.error)
    }
    const lead = busca.value
    if (!lead) {
      this.log.warn({ error: 'LEAD_NAO_ENCONTRADO', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: lead não encontrado')
      return Result.fail(new Error('LEAD_NAO_ENCONTRADO'))
    }

    const contato = lead.primeiroContato()
    if (contato.isFail) {
      this.log.warn({ error: contato.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao obter primeiro contato do lead')
      return Result.fail(contato.error)
    }

    const qualificacao = contato.value.qualificar()
    if (qualificacao.isFail) {
      this.log.warn({ error: qualificacao.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao qualificar contato')
      return Result.fail(qualificacao.error)
    }

    const salvo = await this.leadPort.salvar(qualificacao.value)
    if (salvo.isFail) {
      this.log.warn({ error: salvo.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao salvar lead qualificado')
      return Result.fail(salvo.error)
    }

    const events = salvo.value.getDomainEvents()
    this.publisher.publishAll(events)
    salvo.value.clearEvents()

    return salvo
  }
}
