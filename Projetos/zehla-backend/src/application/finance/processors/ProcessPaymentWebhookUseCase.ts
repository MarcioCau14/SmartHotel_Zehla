import { Result } from '../../../shared/Result'
import { PIIScanner } from '../../../domain/security/services/PIIScanner'
import type { IFinancialGatewayPort } from '../../../domain/finance/ports/IFinancialGatewayPort'
import type { PaymentSplitConfig } from '../../../domain/finance/ports/IFinancialGatewayPort'

export interface ProcessPaymentWebhookInput {
  readonly rawBody: string
  readonly signature: string
}

export interface ProcessPaymentWebhookOutput {
  readonly event: string
  readonly transactionId: string
  readonly status: string
  readonly grossAmount: number
  readonly planName: string | undefined
  readonly pousadaId: string | undefined
}

export class ProcessPaymentWebhookUseCase {
  private readonly gateway: IFinancialGatewayPort

  constructor(gateway: IFinancialGatewayPort) {
    this.gateway = gateway
  }

  async execute(input: ProcessPaymentWebhookInput): Promise<Result<ProcessPaymentWebhookOutput, Error>> {
    const notificationResult = await this.gateway.processWebhook(input.rawBody, input.signature)

    if (notificationResult.isFail) {
      return Result.fail(notificationResult.error)
    }

    const notification = notificationResult.value

    const pousadaId = notification.metadata['pousada_id']
    const planName = notification.metadata['plan']

    const rawForLog = `Webhook received: event=${notification.event}, transaction=${notification.transactionId}, status=${notification.status}`
    const maskedLog = PIIScanner.tokenize(rawForLog).tokenized

    console.log(maskedLog)

    if (notification.status === 'refunded') {
      console.log(`[Stripe Refund] transaction=${notification.transactionId} — valor devolvido.`)
    }

    return Result.ok({
      event: notification.event,
      transactionId: notification.transactionId,
      status: notification.status,
      grossAmount: notification.grossAmount,
      planName,
      pousadaId,
    })
  }
}
