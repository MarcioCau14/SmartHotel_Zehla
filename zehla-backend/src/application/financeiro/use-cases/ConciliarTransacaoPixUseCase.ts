import { Result } from '../../../domain/shared/Result'
import { DomainEvent } from '../../../domain/shared/DomainEvent'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { IPixTransactionRepository } from '../ports/IPixTransactionRepository'
import { IPaymentRepository } from '../ports/IPaymentRepository'
import { IInvoiceRepository } from '../ports/IInvoiceRepository'

export interface ConciliarTransacaoPixInput {
  endToEndId: string
  gatewayTransactionId: string
  amount: number
  status: string
}

export interface ConciliarTransacaoPixOutput {
  result: string
  events: DomainEvent[]
}

export class ConciliarTransacaoPixUseCase {
  constructor(
    private pixTransactionRepo: IPixTransactionRepository,
    private paymentRepo: IPaymentRepository,
    private invoiceRepo: IInvoiceRepository
  ) {}

  async execute(input: ConciliarTransacaoPixInput): Promise<Result<ConciliarTransacaoPixOutput, string>> {
    const existing = await this.pixTransactionRepo.findByEndToEndId(input.endToEndId)
    if (existing) {
      return Result.ok({
        result: 'duplicate_ignored',
        events: [],
      })
    }

    const payment = await this.paymentRepo.findByGatewayTransactionId(input.gatewayTransactionId)
    if (!payment) {
      return Result.fail('Pagamento não encontrado para o gatewayTransactionId fornecido')
    }

    const pixTx = payment.pixTransaction
    if (!pixTx) {
      return Result.fail('Transação PIX não encontrada no pagamento')
    }

    if (pixTx.isExpired()) {
      return Result.fail('QR Code expirado')
    }

    const receivedResult = pixTx.markReceived(input.endToEndId)
    if (receivedResult.isFail) return Result.fail(receivedResult.error)

    const confirmPixResult = pixTx.confirm()
    if (confirmPixResult.isFail) return Result.fail(confirmPixResult.error)

    const confirmPaymentResult = payment.confirm(input.gatewayTransactionId)
    if (confirmPaymentResult.isFail) return Result.fail(confirmPaymentResult.error)

    const invoice = await this.invoiceRepo.findById(payment.invoiceId)
    if (!invoice) {
      return Result.fail('Fatura não encontrada')
    }

    const amountResult = Money.create(input.amount)
    if (amountResult.isFail) return Result.fail(amountResult.error)

    const regResult = invoice.registerPayment(amountResult.value)
    if (regResult.isFail) return Result.fail(regResult.error)

    const events = [...pixTx.events, ...payment.events, ...invoice.events]

    await this.pixTransactionRepo.save(pixTx)
    await this.paymentRepo.save(payment)
    await this.invoiceRepo.save(invoice)

    pixTx.clearEvents()
    payment.clearEvents()
    invoice.clearEvents()

    return Result.ok({
      result: 'conciliated',
      events,
    })
  }
}
