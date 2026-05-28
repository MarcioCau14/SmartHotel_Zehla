import { Result } from '../../../domain/shared/Result'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { Payment } from '../../../domain/financeiro/entities/Payment'

export interface GatewayResponse {
  transactionId: string
  status: string
  raw?: Record<string, unknown>
}

export interface GatewayTransactionStatus {
  status: string
  settled: boolean
  settledAt?: Date
}

export interface GatewayConfig {
  allowInstallments: boolean
  maxInstallments: number
  interestFreeLimit: number
}

export interface IGatewayTransactionPort {
  processPayment(payment: Payment, gatewayConfig: GatewayConfig): Promise<Result<GatewayResponse, string>>
  refundTransaction(gatewayTxnId: string, amount: Money): Promise<Result<GatewayResponse, string>>
  getTransactionStatus(gatewayTxnId: string): Promise<Result<GatewayTransactionStatus, string>>
}
