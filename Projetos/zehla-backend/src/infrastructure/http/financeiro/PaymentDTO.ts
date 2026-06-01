import { Payment } from '../../../domain/financeiro/entities/Payment'

export interface PaymentResponseDTO {
  id: string
  invoiceId: string
  status: string
  method: string
  amount: number
  gatewayTransactionId: string | null
  failureReason: string | null
  processedAt: string | null
  createdAt: string
  pixTransaction: PixTransactionDTO | null
}

export interface PixTransactionDTO {
  id: string
  status: string
  pixKeyType: string
  pixKeyValue: string
  amount: number
  description: string
  qrCode: string
  expiresAt: string
  endToEndId: string | null
  confirmedAt: string | null
  createdAt: string
}

export function paymentToDTO(payment: Payment): PaymentResponseDTO {
  const pixTx = payment.pixTransaction
  return {
    id: payment.id,
    invoiceId: payment.invoiceId,
    status: payment.status,
    method: payment.method,
    amount: payment.amount.toNumber(),
    gatewayTransactionId: payment.gatewayTransactionId,
    failureReason: payment.failureReason,
    processedAt: payment.processedAt?.toISOString() ?? null,
    createdAt: payment.createdAt.toISOString(),
    pixTransaction: pixTx
      ? {
          id: pixTx.id,
          status: pixTx.status,
          pixKeyType: pixTx.pixKey.type,
          pixKeyValue: pixTx.pixKey.value,
          amount: pixTx.amount.toNumber(),
          description: pixTx.description,
          qrCode: pixTx.qrCode,
          expiresAt: pixTx.expiresAt.toISOString(),
          endToEndId: pixTx.endToEndId,
          confirmedAt: pixTx.confirmedAt?.toISOString() ?? null,
          createdAt: pixTx.createdAt.toISOString(),
        }
      : null,
  }
}
