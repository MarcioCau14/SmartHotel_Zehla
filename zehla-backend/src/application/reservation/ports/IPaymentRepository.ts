import { Payment } from '../../../domain/reservation/entities/Payment'
import { PaymentStatus } from '../../../domain/reservation/PaymentStatus'

export interface IPaymentRepository {
  save(payment: Payment): Promise<Payment>
  update(payment: Payment): Promise<Payment>
  findById(id: string): Promise<Payment | null>
  findByReservationId(reservationId: string): Promise<Payment | null>
  findByExternalId(externalId: string): Promise<Payment | null>
  findByProperty(propertyId: string, status?: PaymentStatus): Promise<Payment[]>
}
