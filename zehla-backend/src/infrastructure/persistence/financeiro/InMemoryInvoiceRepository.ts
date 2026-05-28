import { Invoice } from '../../../domain/financeiro/entities/Invoice'
import { InvoiceStatus } from '../../../domain/financeiro/enums'
import { IInvoiceRepository, InvoiceFilters } from '../../../application/financeiro/ports/IInvoiceRepository'

export class InMemoryInvoiceRepository implements IInvoiceRepository {
  private invoices = new Map<string, Invoice>()
  private invoiceProperties = new Map<string, string>()

  async save(invoice: Invoice, propertyId?: string): Promise<Invoice> {
    this.invoices.set(invoice.id, invoice)
    if (propertyId) {
      this.invoiceProperties.set(invoice.id, propertyId)
    }
    return invoice
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.invoices.get(id) ?? null
  }

  async findByProperty(propertyId: string, filters?: InvoiceFilters): Promise<Invoice[]> {
    let result = Array.from(this.invoices.values()).filter(
      (inv) => this.invoiceProperties.get(inv.id) === propertyId
    )

    if (filters) {
      if (filters.status) {
        result = result.filter((inv) => inv.status === filters.status)
      }
      if (filters.month !== undefined || filters.year !== undefined) {
        result = result.filter((inv) => {
          const invMonth = inv.number.getMonth()
          const invYear = inv.number.getYear()
          if (filters.month !== undefined && invMonth !== filters.month) return false
          if (filters.year !== undefined && invYear !== filters.year) return false
          return true
        })
      }
      if (filters.startDate) {
        result = result.filter((inv) => inv.billingPeriod.startDate >= filters.startDate!)
      }
      if (filters.endDate) {
        result = result.filter((inv) => inv.billingPeriod.endDate <= filters.endDate!)
      }
      if (filters.offset !== undefined) {
        result = result.slice(filters.offset)
      }
      if (filters.limit !== undefined) {
        result = result.slice(0, filters.limit)
      }
    }

    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return result
  }

  async findByReservation(reservationId: string): Promise<Invoice | null> {
    for (const inv of this.invoices.values()) {
      if (inv.reservationId === reservationId) return inv
    }
    return null
  }

  async findByStatus(propertyId: string, status: InvoiceStatus): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (inv) => this.invoiceProperties.get(inv.id) === propertyId && inv.status === status
    )
  }

  async findOverdue(referenceDate: Date): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter((inv) => {
      if (inv.status === InvoiceStatus.PAID || inv.status === InvoiceStatus.CANCELLED || inv.status === InvoiceStatus.OVERDUE) {
        return false
      }
      if (inv.status === InvoiceStatus.DRAFT) return false
      return inv.billingPeriod.endDate < referenceDate
    })
  }

  async findDraft(propertyId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (inv) => this.invoiceProperties.get(inv.id) === propertyId && inv.status === InvoiceStatus.DRAFT
    )
  }

  async countByProperty(propertyId: string, filters?: InvoiceFilters): Promise<number> {
    const items = await this.findByProperty(propertyId, filters)
    return items.length
  }

  clear(): void {
    this.invoices.clear()
    this.invoiceProperties.clear()
  }
}
