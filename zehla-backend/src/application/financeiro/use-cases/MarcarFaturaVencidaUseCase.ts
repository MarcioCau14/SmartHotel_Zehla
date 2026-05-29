import { Result } from '../../../domain/shared/Result'
import { DomainEvent } from '../../../domain/shared/DomainEvent'
import { IInvoiceRepository } from '../ports/IInvoiceRepository'

export interface MarcarFaturaVencidaInput {
  invoiceId?: string
}

export interface MarcarFaturaVencidaOutput {
  processed: number
  events: DomainEvent[]
}

export class MarcarFaturaVencidaUseCase {
  constructor(private invoiceRepo: IInvoiceRepository) {}

  async execute(input: MarcarFaturaVencidaInput): Promise<Result<MarcarFaturaVencidaOutput, string>> {
    const allEvents: DomainEvent[] = []
    let processed = 0

    if (input.invoiceId) {
      const invoice = await this.invoiceRepo.findById(input.invoiceId)
      if (!invoice) {
        return Result.fail('Fatura não encontrada')
      }

      const markResult = invoice.markOverdue()
      if (markResult.isFail) return Result.fail(markResult.error)

      allEvents.push(...invoice.events)
      await this.invoiceRepo.save(invoice)
      invoice.clearEvents()
      processed = 1
    } else {
      const overdueInvoices = await this.invoiceRepo.findOverdue(new Date())
      for (const invoice of overdueInvoices) {
        const markResult = invoice.markOverdue()
        if (markResult.isFail) continue

        allEvents.push(...invoice.events)
        await this.invoiceRepo.save(invoice)
        invoice.clearEvents()
        processed++
      }
    }

    return Result.ok({
      processed,
      events: allEvents,
    })
  }
}
