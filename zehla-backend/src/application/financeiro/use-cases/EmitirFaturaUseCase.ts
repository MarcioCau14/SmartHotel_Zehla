import { Result } from '../../../domain/shared/Result'
import { DomainEvent } from '../../../domain/shared/DomainEvent'
import { IInvoiceRepository } from '../ports/IInvoiceRepository'

export interface EmitirFaturaInput {
  invoiceId: string
}

export interface EmitirFaturaOutput {
  id: string
  status: string
  issuedAt: Date
  events: DomainEvent[]
}

export class EmitirFaturaUseCase {
  constructor(private invoiceRepo: IInvoiceRepository) {}

  async execute(input: EmitirFaturaInput): Promise<Result<EmitirFaturaOutput, string>> {
    const invoice = await this.invoiceRepo.findById(input.invoiceId)
    if (!invoice) {
      return Result.fail('Fatura não encontrada')
    }

    const issueResult = invoice.issue()
    if (issueResult.isFail) return Result.fail(issueResult.error)

    const events = [...invoice.events]
    await this.invoiceRepo.save(invoice)
    invoice.clearEvents()

    return Result.ok({
      id: invoice.id,
      status: invoice.status,
      issuedAt: invoice.issuedAt!,
      events,
    })
  }
}
