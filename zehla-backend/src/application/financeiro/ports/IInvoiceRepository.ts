import { Invoice } from '../../../domain/financeiro/entities/Invoice'
import { InvoiceStatus } from '../../../domain/financeiro/enums'

export interface InvoiceFilters {
  status?: InvoiceStatus
  month?: number
  year?: number
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface IInvoiceRepository {
  save(invoice: Invoice, propertyId?: string): Promise<Invoice>
  findById(id: string): Promise<Invoice | null>
  findByProperty(propertyId: string, filters?: InvoiceFilters): Promise<Invoice[]>
  findByReservation(reservationId: string): Promise<Invoice | null>
  findByStatus(propertyId: string, status: InvoiceStatus): Promise<Invoice[]>
  findOverdue(referenceDate: Date): Promise<Invoice[]>
  findDraft(propertyId: string): Promise<Invoice[]>
  countByProperty(propertyId: string, filters?: InvoiceFilters): Promise<number>
}
