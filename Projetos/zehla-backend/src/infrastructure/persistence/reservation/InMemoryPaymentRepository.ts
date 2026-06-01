import { Payment } from '../../../domain/reservation/entities/Payment'
import { PaymentStatus } from '../../../domain/reservation/PaymentStatus'
import { IPaymentRepository } from '../../../application/reservation/ports/IPaymentRepository'

export class InMemoryPaymentRepository implements IPaymentRepository {
  private payments = new Map<string, Payment>()

  async save(payment: Payment): Promise<Payment> {
    this.payments.set(payment.id, payment)
    return payment
  }

  async update(payment: Payment): Promise<Payment> {
    this.payments.set(payment.id, payment)
    return payment
  }

  async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) ?? null
  }

  async findByReservationId(reservationId: string): Promise<Payment | null> {
    for (const p of this.payments.values()) {
      if (p.reservationId === reservationId) return p
    }
    return null
  }

  async findByExternalId(externalId: string): Promise<Payment | null> {
    for (const p of this.payments.values()) {
      if (p.externalId === externalId) return p
    }
    return null
  }

  async findByProperty(propertyId: string, status?: PaymentStatus): Promise<Payment[]> {
    let result = Array.from(this.payments.values()).filter((p) => p.propertyId === propertyId)
    if (status) result = result.filter((p) => p.status === status)
    return result
  }

  clear(): void {
    this.payments.clear()
  }
}
