import { Payment } from '../../../domain/financeiro/entities/Payment'
import { PaymentStatus } from '../../../domain/financeiro/enums'

export interface IPaymentRepository {
  save(payment: Payment, propertyId?: string): Promise<Payment>
  findById(id: string): Promise<Payment | null>
  findByInvoice(invoiceId: string): Promise<Payment[]>
  findByStatus(status: PaymentStatus): Promise<Payment[]>
  findByGatewayTransactionId(gatewayTxnId: string): Promise<Payment | null>
  findPendingByProperty(propertyId: string): Promise<Payment[]>
}
