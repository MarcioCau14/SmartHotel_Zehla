import { Result } from '../../../domain/shared/Result'
import { DomainEvent } from '../../../domain/shared/DomainEvent'
import { IInvoiceRepository } from '../ports/IInvoiceRepository'
import { IPaymentRepository } from '../ports/IPaymentRepository'
import { PaymentStatus } from '../../../domain/financeiro/enums'

export interface CancelarFaturaInput {
  invoiceId: string
  reason: string
}

export interface CancelarFaturaOutput {
  id: string
  status: string
  events: DomainEvent[]
}

export class CancelarFaturaUseCase {
  constructor(
    private invoiceRepo: IInvoiceRepository,
    private paymentRepo: IPaymentRepository
  ) {}

  async execute(input: CancelarFaturaInput): Promise<Result<CancelarFaturaOutput, string>> {
    const invoice = await this.invoiceRepo.findById(input.invoiceId)
    if (!invoice) {
      return Result.fail('Fatura não encontrada')
    }

    const payments = await this.paymentRepo.findByInvoice(input.invoiceId)
    const hasNonRefundedPayment = payments.some(
      p => p.status === PaymentStatus.CONFIRMED || p.status === PaymentStatus.PROCESSING || p.status === PaymentStatus.PENDING
    )
    if (hasNonRefundedPayment) {
      return Result.fail('Não é possível cancelar fatura com pagamentos ativos. Estorne os pagamentos primeiro.')
    }

    const cancelResult = invoice.cancel(input.reason)
    if (cancelResult.isFail) return Result.fail(cancelResult.error)

    const events = [...invoice.events]
    await this.invoiceRepo.save(invoice)
    invoice.clearEvents()

    return Result.ok({
      id: invoice.id,
      status: invoice.status,
      events,
    })
  }
}
