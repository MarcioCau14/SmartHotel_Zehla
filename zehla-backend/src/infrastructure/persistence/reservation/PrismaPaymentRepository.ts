import { PrismaClient } from '@prisma/client'
import { Payment } from '../../../domain/reservation/entities/Payment'
import { Money } from '../../../domain/reservation/value-objects/Money'
import { PaymentMethod } from '../../../domain/reservation/PaymentMethod'
import { PaymentStatus } from '../../../domain/reservation/PaymentStatus'
import { IPaymentRepository } from '../../../application/reservation/ports/IPaymentRepository'

export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private prisma: PrismaClient) {}

  async save(payment: Payment): Promise<Payment> {
    const data = payment.toJSON()
    await this.prisma.payment.create({
      data: {
        id: data.id,
        reservationId: data.reservationId,
        propertyId: data.propertyId,
        amount: data.amount.amount,
        method: data.method as any,
        status: data.status as any,
        externalId: undefined,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
        refundedAt: data.refundedAt ? new Date(data.refundedAt) : undefined,
      },
    })
    return payment
  }

  async update(payment: Payment): Promise<Payment> {
    const data = payment.toJSON()
    await this.prisma.payment.update({
      where: { id: data.id },
      data: {
        status: data.status as any,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
        refundedAt: data.refundedAt ? new Date(data.refundedAt) : undefined,
      },
    })
    return payment
  }

  async findById(id: string): Promise<Payment | null> {
    const row = await this.prisma.payment.findUnique({ where: { id } })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByReservationId(reservationId: string): Promise<Payment | null> {
    const row = await this.prisma.payment.findUnique({ where: { reservationId } })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByExternalId(externalId: string): Promise<Payment | null> {
    const row = await this.prisma.payment.findFirst({ where: { externalId } })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByProperty(propertyId: string, status?: PaymentStatus): Promise<Payment[]> {
    const where: any = { propertyId }
    if (status) where.status = status
    const rows = await this.prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' } })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Payment[]
  }

  private hydrate(row: any): Payment | null {
    const amount = Money.create(row.amount)
    if (amount.isFail) return null

    const paymentResult = Payment.create({
      id: row.id,
      reservationId: row.reservationId,
      propertyId: row.propertyId,
      amount: amount.value,
      method: row.method as PaymentMethod,
      externalId: row.externalId ?? undefined,
    })
    if (paymentResult.isFail) return null

    return paymentResult.value
  }
}
