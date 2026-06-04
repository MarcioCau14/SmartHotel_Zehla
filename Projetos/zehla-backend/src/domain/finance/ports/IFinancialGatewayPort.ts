import { Result } from '../../../shared/Result'

export type SplitRecipientRole = 'plataforma' | 'pousada'
export type PaymentStatus = 'pending' | 'approved' | 'failed' | 'refunded'

export interface SplitRecipient {
  readonly recipientId: string
  readonly amount: number
  readonly percentage: number
  readonly liable: boolean
  readonly chargeProcessingFee: boolean
}

export interface PaymentSplitConfig {
  readonly transactionId: string
  readonly grossAmount: number
  readonly zehlaCommission: number
  readonly pousadaNetAmount: number
  readonly recipients: ReadonlyArray<SplitRecipient>
  readonly createdAt: Date
}

export function createSplitConfig(
  transactionId: string,
  grossAmount: number,
  zehlaRecipientId: string,
  pousadaRecipientId: string,
  zehlaPercentage: number,
): PaymentSplitConfig {
  const zehlaAmount = Math.round(grossAmount * zehlaPercentage * 100) / 100
  const pousadaAmount = Math.round((grossAmount - zehlaAmount) * 100) / 100

  const config: PaymentSplitConfig = Object.freeze({
    transactionId,
    grossAmount,
    zehlaCommission: zehlaAmount,
    pousadaNetAmount: pousadaAmount,
    recipients: Object.freeze([
      Object.freeze({
        recipientId: zehlaRecipientId,
        amount: zehlaAmount,
        percentage: zehlaPercentage,
        liable: false,
        chargeProcessingFee: false,
      }),
      Object.freeze({
        recipientId: pousadaRecipientId,
        amount: pousadaAmount,
        percentage: Math.round((1 - zehlaPercentage) * 10000) / 100,
        liable: true,
        chargeProcessingFee: true,
      }),
    ]),
    createdAt: new Date(),
  })

  return config
}

export function zehlaSplitPercentage(planoNome: string): number {
  switch (planoNome) {
    case 'LITE': return 0.10
    case 'PRO': return 0.15
    case 'MAX': return 0.20
    default: return 0.05
  }
}

export interface PaymentNotification {
  readonly id: string
  readonly event: string
  readonly transactionId: string
  readonly status: PaymentStatus
  readonly grossAmount: number
  readonly netAmount: number
  readonly paidAmount: number
  readonly metadata: Record<string, string>
  readonly rawPayload: string
}

export interface IFinancialGatewayPort {
  createSplitPayment(
    amount: number,
    zehlaRecipientId: string,
    pousadaRecipientId: string,
    planName: string,
    idempotencyKey: string,
  ): Promise<Result<PaymentSplitConfig, Error>>

  processWebhook(rawBody: string, signature: string): Promise<Result<PaymentNotification, Error>>

  getRecipientBalance(recipientId: string): Promise<Result<{ available: number; pending: number }, Error>>

  cancelSplit(transactionId: string): Promise<Result<void, Error>>
}
