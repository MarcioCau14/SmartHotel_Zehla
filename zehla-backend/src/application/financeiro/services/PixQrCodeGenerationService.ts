import { Result } from '../../../domain/shared/Result'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { PixKey } from '../../../domain/financeiro/value-objects/PixKey'
import { Payment } from '../../../domain/financeiro/entities/Payment'
import { PixTransaction } from '../../../domain/financeiro/entities/PixTransaction'
import { PaymentMethod } from '../../../domain/financeiro/enums'
import { IPixGatewayPort, PixQrCodeData } from '../ports/IPixGatewayPort'

export interface PixGenerationResult {
  payment: Payment
  pixTransaction: PixTransaction
  qrCodeData: PixQrCodeData
}

export class PixQrCodeGenerationService {
  constructor(private pixGateway: IPixGatewayPort) {}

  async execute(params: {
    paymentId: string
    pixTransactionId: string
    invoiceId: string
    amount: Money
    pixKey: PixKey
    description: string
    expiresAt: Date
    expirationMinutes: number
  }): Promise<Result<PixGenerationResult, string>> {
    const pixResult = PixTransaction.create({
      id: params.pixTransactionId,
      pixKey: params.pixKey,
      amount: params.amount,
      description: params.description,
      qrCode: '',
      expiresAt: params.expiresAt,
    })
    if (pixResult.isFail) return Result.fail(pixResult.error)

    const pixTransaction = pixResult.value

    const paymentResult = Payment.create({
      id: params.paymentId,
      invoiceId: params.invoiceId,
      method: PaymentMethod.PIX,
      amount: params.amount,
      pixTransaction,
    })
    if (paymentResult.isFail) return Result.fail(paymentResult.error)

    const payment = paymentResult.value
    const initiateResult = payment.initiate()
    if (initiateResult.isFail) return Result.fail(initiateResult.error)

    const qrResult = await this.pixGateway.generateQrCode(params.amount, params.pixKey, params.expirationMinutes)
    if (qrResult.isFail) return Result.fail(qrResult.error)

    const qrCodeData = qrResult.value

    return Result.ok({ payment, pixTransaction, qrCodeData })
  }
}
