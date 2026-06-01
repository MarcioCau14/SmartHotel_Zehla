import { Payment } from '../../../domain/financeiro/entities/Payment'
import { PaymentStatus } from '../../../domain/financeiro/enums'
import { IPaymentRepository } from '../../../application/financeiro/ports/IPaymentRepository'

export class InMemoryPaymentRepository implements IPaymentRepository {
  private payments = new Map<string, Payment>()
  private paymentProperties = new Map<string, string>()

  async save(payment: Payment, propertyId?: string): Promise<Payment> {
    this.payments.set(payment.id, payment)
    if (propertyId) {
      this.paymentProperties.set(payment.id, propertyId)
    }
    return payment
  }

  async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) ?? null
  }

  async findByInvoice(invoiceId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter((p) => p.invoiceId === invoiceId)
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter((p) => p.status === status)
  }

  async findByGatewayTransactionId(gatewayTxnId: string): Promise<Payment | null> {
    for (const payment of this.payments.values()) {
      if (payment.gatewayTransactionId === gatewayTxnId) return payment
    }
    return null
  }

  async findPendingByProperty(propertyId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter((p) => {
      const prop = this.paymentProperties.get(p.id)
      return prop === propertyId && p.status === PaymentStatus.PENDING
    })
  }

  clear(): void {
    this.payments.clear()
    this.paymentProperties.clear()
  }
}
