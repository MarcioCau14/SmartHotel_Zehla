import { PrismaClient } from '@prisma/client'
import { Invoice } from '../../../domain/financeiro/entities/Invoice'
import { InvoiceItem } from '../../../domain/financeiro/entities/InvoiceItem'
import { InvoiceNumber } from '../../../domain/financeiro/value-objects/InvoiceNumber'
import { BillingPeriod } from '../../../domain/financeiro/value-objects/BillingPeriod'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { Discount } from '../../../domain/financeiro/value-objects/Discount'
import { InvoiceStatus, InvoiceItemType, DiscountType } from '../../../domain/financeiro/enums'
import { IInvoiceRepository, InvoiceFilters } from '../../../application/financeiro/ports/IInvoiceRepository'

export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(private prisma: PrismaClient) {}

  async save(invoice: Invoice, propertyId?: string): Promise<Invoice> {
    const invData = {
      id: invoice.id,
      number: invoice.number.value,
      propertyId: propertyId ?? '',
      guestId: invoice.guestId,
      reservationId: invoice.reservationId,
      status: invoice.status as any,
      totalAmount: invoice.totalAmount.toNumber(),
      paidAmount: invoice.paidAmount.toNumber(),
      dueDate: invoice.billingPeriod.endDate,
      issuedAt: invoice.issuedAt,
      cancelledAt: invoice.cancelledAt,
      cancelReason: invoice.cancelReason,
      overdueAt: invoice.overdueAt,
    }

    const upserted = await this.prisma.financeiroInvoice.upsert({
      where: { id: invoice.id },
      create: invData,
      update: invData,
    })

    await this.prisma.financeiroInvoiceItem.deleteMany({ where: { invoiceId: invoice.id } })
    for (const item of invoice.items) {
      await this.prisma.financeiroInvoiceItem.create({
        data: {
          id: item.id,
          invoiceId: invoice.id,
          description: item.description,
          type: item.type as any,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toNumber(),
          totalPrice: item.totalPrice.toNumber(),
        },
      })
    }

    return invoice
  }

  async findById(id: string): Promise<Invoice | null> {
    const row = await this.prisma.financeiroInvoice.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByProperty(propertyId: string, filters?: InvoiceFilters): Promise<Invoice[]> {
    const where: any = { propertyId }
    if (filters) {
      if (filters.status) where.status = filters.status
      if (filters.month !== undefined || filters.year !== undefined) {
        where.number = {}
        if (filters.year !== undefined) {
          where.number.startsWith = `INV-${filters.year}${filters.month !== undefined ? String(filters.month).padStart(2, '0') : ''}`
        }
      }
    }

    const rows = await this.prisma.financeiroInvoice.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit ?? 100,
      skip: filters?.offset ?? 0,
    })

    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Invoice[]
  }

  async findByReservation(reservationId: string): Promise<Invoice | null> {
    const row = await this.prisma.financeiroInvoice.findUnique({
      where: { reservationId },
      include: { items: true },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByStatus(propertyId: string, status: InvoiceStatus): Promise<Invoice[]> {
    const rows = await this.prisma.financeiroInvoice.findMany({
      where: { propertyId, status: status as any },
      include: { items: true },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Invoice[]
  }

  async findOverdue(referenceDate: Date): Promise<Invoice[]> {
    const rows = await this.prisma.financeiroInvoice.findMany({
      where: {
        status: { in: ['ISSUED', 'PARTIALLY_PAID'] as any },
        dueDate: { lt: referenceDate },
      },
      include: { items: true },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Invoice[]
  }

  async findDraft(propertyId: string): Promise<Invoice[]> {
    const rows = await this.prisma.financeiroInvoice.findMany({
      where: { propertyId, status: 'DRAFT' as any },
      include: { items: true },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Invoice[]
  }

  async countByProperty(propertyId: string, filters?: InvoiceFilters): Promise<number> {
    const where: any = { propertyId }
    if (filters?.status) where.status = filters.status
    return this.prisma.financeiroInvoice.count({ where })
  }

  private hydrate(row: any): Invoice | null {
    try {
      const billingPeriodResult = BillingPeriod.create(
        new Date(row.dueDate ?? new Date()),
        new Date(row.dueDate ?? new Date())
      )
      if (billingPeriodResult.isFail) return null

      const numberResult = row.number
        ? InvoiceNumber.create(row.number)
        : InvoiceNumber.generate(1, 2025, 1)
      if (numberResult.isFail) return null

      const invoice = Invoice.restore({
        id: row.id,
        number: numberResult.value,
        guestId: row.guestId,
        reservationId: row.reservationId,
        status: row.status as InvoiceStatus,
        billingPeriod: billingPeriodResult.value,
        items: (row.items ?? []).map((item: any) => {
          const unitPriceResult = Money.create(item.unitPrice ?? 0)
          const totalPrice = unitPriceResult.isOk ? unitPriceResult.value.multiply(item.quantity ?? 1) : Money.zero()
          return InvoiceItem.create({
            id: item.id,
            description: item.description,
            type: (item.type as InvoiceItemType) ?? InvoiceItemType.OTHER,
            unitPrice: unitPriceResult.isOk ? unitPriceResult.value : Money.zero(),
            quantity: item.quantity ?? 1,
          }).value
        }),
        discounts: [],
        paidAmount: Money.create(row.paidAmount ?? 0).isOk
          ? Money.create(row.paidAmount ?? 0).value
          : Money.zero(),
        issuedAt: row.issuedAt ?? null,
        cancelledAt: row.cancelledAt ?? null,
        cancelReason: row.cancelReason ?? null,
        overdueAt: row.overdueAt ?? null,
        createdAt: row.createdAt ?? new Date(),
      })

      return invoice
    } catch {
      return null
    }
  }
}
