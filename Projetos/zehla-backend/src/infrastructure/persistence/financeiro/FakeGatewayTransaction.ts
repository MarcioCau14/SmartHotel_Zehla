import { Result } from '../../../domain/shared/Result'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { Payment } from '../../../domain/financeiro/entities/Payment'
import {
  IGatewayTransactionPort,
  GatewayResponse,
  GatewayTransactionStatus,
  GatewayConfig,
} from '../../../application/financeiro/ports/IGatewayTransactionPort'

export class FakeGatewayTransaction implements IGatewayTransactionPort {
  async processPayment(
    payment: Payment,
    _gatewayConfig: GatewayConfig
  ): Promise<Result<GatewayResponse, string>> {
    return Result.ok({
      transactionId: `fake-txn-${payment.id}-${Date.now()}`,
      status: 'CONFIRMED',
      raw: { simulated: true },
    })
  }

  async refundTransaction(
    gatewayTxnId: string,
    _amount: Money
  ): Promise<Result<GatewayResponse, string>> {
    return Result.ok({
      transactionId: `refund-${gatewayTxnId}-${Date.now()}`,
      status: 'REFUNDED',
      raw: { simulated: true, refunded: true },
    })
  }

  async getTransactionStatus(
    gatewayTxnId: string
  ): Promise<Result<GatewayTransactionStatus, string>> {
    return Result.ok({
      status: 'CONFIRMED',
      settled: true,
      settledAt: new Date(),
    })
  }
}
