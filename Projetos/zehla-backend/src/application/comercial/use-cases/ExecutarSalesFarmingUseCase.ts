import { Result } from '../../../shared/Result'
import { IComercialLeadPort } from '../ports/IComercialLeadPort'
import { ComercialLead } from '../../../domain/comercial/entities/ComercialLead'
import { DomainEventPublisher } from '../../../domain/shared/events/DomainEventPublisher'

export interface FarmingResultado {
  reativados: number
  farmingEnviados: number
  erros: string[]
}

export class ExecutarSalesFarmingUseCase {
  constructor(
    private readonly leadPort: IComercialLeadPort,
    private readonly publisher: DomainEventPublisher,
    private readonly diasLimitePerda: number = 30,
    private readonly diasLimiteNoShow: number = 7,
  ) {}

  async execute(): Promise<Result<FarmingResultado, Error>> {
    const resultado: FarmingResultado = { reativados: 0, farmingEnviados: 0, erros: [] }

    const perdidos = await this.leadPort.listarPorEstado('perdido')
    if (perdidos.isOk) {
      for (const lead of perdidos.value) {
        const dias = lead.diasSemInteracao
        if (dias >= this.diasLimitePerda) {
          const farming = lead.entrarSalesFarming()
          if (farming.isOk) {
            const salvo = await this.leadPort.salvar(farming.value)
            if (salvo.isOk) {
              const events = salvo.value.getDomainEvents()
              this.publisher.publishAll(events)
              salvo.value.clearEvents()
              resultado.farmingEnviados++
            } else {
              resultado.erros.push(`Farming lead ${lead.id}: ${salvo.error.message}`)
            }
          }
        } else if (dias >= Math.floor(this.diasLimitePerda / 2)) {
          const reativado = lead.reativar('Tentativa reativação via Sales Farming')
          if (reativado.isOk) {
            const salvo = await this.leadPort.salvar(reativado.value)
            if (salvo.isOk) {
              const events = salvo.value.getDomainEvents()
              this.publisher.publishAll(events)
              salvo.value.clearEvents()
              resultado.reativados++
            } else {
              resultado.erros.push(`Reativacao lead ${lead.id}: ${salvo.error.message}`)
            }
          }
        }
      }
    }

    const noShows = await this.leadPort.listarPorEstado('no_show')
    if (noShows.isOk) {
      for (const lead of noShows.value) {
        if (lead.diasSemInteracao >= this.diasLimiteNoShow) {
          const farming = lead.entrarSalesFarming()
          if (farming.isOk) {
            const salvo = await this.leadPort.salvar(farming.value)
            if (salvo.isOk) {
              const events = salvo.value.getDomainEvents()
              this.publisher.publishAll(events)
              salvo.value.clearEvents()
              resultado.farmingEnviados++
            } else {
              resultado.erros.push(`Farming no-show ${lead.id}: ${salvo.error.message}`)
            }
          }
        }
      }
    }

    return Result.ok(resultado)
  }
}
