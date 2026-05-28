import { Result } from '../../../domain/shared/Result'
import { DomainEvent } from '../../../domain/shared/DomainEvent'
import { PixKey, PixKeyType } from '../../../domain/financeiro/value-objects/PixKey'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { PixTransaction } from '../../../domain/financeiro/entities/PixTransaction'
import { Payment } from '../../../domain/financeiro/entities/Payment'
import { PaymentMethod } from '../../../domain/financeiro/enums'
import { IInvoiceRepository } from '../ports/IInvoiceRepository'
import { IPaymentRepository } from '../ports/IPaymentRepository'
import { IPixTransactionRepository } from '../ports/IPixTransactionRepository'
import { IPixGatewayPort } from '../ports/IPixGatewayPort'

export interface ProcessarPagamentoPixInput {
  invoiceId: string
  amount: number
  pixKeyType: PixKeyType
  pixKeyValue: string
  description: string
  expirationMinutes?: number
}

export interface ProcessarPagamentoPixOutput {
  paymentId: string
  gatewayTransactionId: string
  pixTransactionId: string
  qrCode: string
  qrCodeBase64: string
  copyPasteKey: string
  expiration: Date
  status: string
  events: DomainEvent[]
}

export class ProcessarPagamentoPixUseCase {
  private readonly DEFAULT_EXPIRATION = 30

  constructor(
    private invoiceRepo: IInvoiceRepository,
    private paymentRepo: IPaymentRepository,
    private pixTransactionRepo: IPixTransactionRepository,
    private pixGateway: IPixGatewayPort
  ) {}

  async execute(input: ProcessarPagamentoPixInput): Promise<Result<ProcessarPagamentoPixOutput, string>> {
    const invoice = await this.invoiceRepo.findById(input.invoiceId)
    if (!invoice) {
      return Result.fail('Fatura não encontrada')
    }

    const amountResult = Money.create(input.amount)
    if (amountResult.isFail) return Result.fail(amountResult.error)
    const amount = amountResult.value

    const remaining = invoice.remainingBalance()
    if (amount.isGreaterThan(remaining)) {
      return Result.fail('Valor do pagamento excede o saldo restante da fatura')
    }

    const pixKeyResult = PixKey.create(input.pixKeyType, input.pixKeyValue)
    if (pixKeyResult.isFail) return Result.fail(pixKeyResult.error)

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + (input.expirationMinutes ?? this.DEFAULT_EXPIRATION))

    const pixTransactionId = crypto.randomUUID()
    const paymentId = crypto.randomUUID()

    const qrResult = await this.pixGateway.generateQrCode(amount, pixKeyResult.value, input.expirationMinutes ?? this.DEFAULT_EXPIRATION)
    if (qrResult.isFail) return Result.fail(qrResult.error)
    const qrCodeData = qrResult.value

    const pixTxResult = PixTransaction.create({
      id: pixTransactionId,
      pixKey: pixKeyResult.value,
      amount,
      description: input.description,
      qrCode: qrCodeData.qrCode,
      expiresAt,
    })
    if (pixTxResult.isFail) return Result.fail(pixTxResult.error)
    const pixTransaction = pixTxResult.value

    const paymentResult = Payment.create({
      id: paymentId,
      invoiceId: input.invoiceId,
      method: PaymentMethod.PIX,
      amount,
      pixTransaction,
    })
    if (paymentResult.isFail) return Result.fail(paymentResult.error)
    const payment = paymentResult.value

    const initiateResult = payment.initiate()
    if (initiateResult.isFail) return Result.fail(initiateResult.error)

    const regResult = invoice.registerPayment(amount)
    if (regResult.isFail) return Result.fail(regResult.error)

    const confirmResult = payment.confirm(qrCodeData.gatewayTransactionId)
    if (confirmResult.isFail) return Result.fail(confirmResult.error)

    const events = [...invoice.events, ...payment.events]

    await this.pixTransactionRepo.save(pixTransaction)
    await this.paymentRepo.save(payment)
    await this.invoiceRepo.save(invoice)

    invoice.clearEvents()
    payment.clearEvents()
    pixTransaction.clearEvents()

    return Result.ok({
      paymentId: payment.id,
      gatewayTransactionId: payment.gatewayTransactionId ?? '',
      pixTransactionId: pixTransaction.id,
      qrCode: qrCodeData.qrCode,
      qrCodeBase64: qrCodeData.qrCodeBase64,
      copyPasteKey: qrCodeData.copyPasteKey,
      expiration: qrCodeData.expiration,
      status: payment.status,
      events,
    })
  }
}
