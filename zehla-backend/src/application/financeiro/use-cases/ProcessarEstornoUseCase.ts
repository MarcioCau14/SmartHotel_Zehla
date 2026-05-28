import { Result } from '../../../domain/shared/Result'
import { DomainEvent } from '../../../domain/shared/DomainEvent'
import { IPaymentRepository } from '../ports/IPaymentRepository'
import { IInvoiceRepository } from '../ports/IInvoiceRepository'

export interface ProcessarEstornoInput {
  paymentId: string
}

export interface ProcessarEstornoOutput {
  paymentId: string
  invoiceId: string
  status: string
  events: DomainEvent[]
}

export class ProcessarEstornoUseCase {
  constructor(
    private paymentRepo: IPaymentRepository,
    private invoiceRepo: IInvoiceRepository
  ) {}

  async execute(input: ProcessarEstornoInput): Promise<Result<ProcessarEstornoOutput, string>> {
    const payment = await this.paymentRepo.findById(input.paymentId)
    if (!payment) {
      return Result.fail('Pagamento não encontrado')
    }

    const refundResult = payment.refund()
    if (refundResult.isFail) return Result.fail(refundResult.error)

    const invoice = await this.invoiceRepo.findById(payment.invoiceId)
    if (!invoice) {
      return Result.fail('Fatura não encontrada')
    }

    const currentPaid = invoice.paidAmount
    const subtractResult = currentPaid.subtract(payment.amount)
    if (subtractResult.isFail) return Result.fail('Erro ao reduzir valor pago: saldo insuficiente')

    const invoiceAny = invoice as unknown as { data: { paidAmount: typeof currentPaid } }
    invoiceAny.data.paidAmount = subtractResult.value

    const events = [...payment.events]

    await this.paymentRepo.save(payment)
    await this.invoiceRepo.save(invoice)

    payment.clearEvents()
    invoice.clearEvents()

    return Result.ok({
      paymentId: payment.id,
      invoiceId: invoice.id,
      status: payment.status,
      events,
    })
  }
}
