import { Result } from '../../../domain/shared/Result'
import { InvoiceStatus } from '../../../domain/financeiro/enums'
import { IInvoiceRepository, InvoiceFilters } from '../ports/IInvoiceRepository'

export interface ListarFaturamentoInput {
  propertyId: string
  month?: number
  year?: number
  status?: InvoiceStatus
  limit?: number
  offset?: number
}

export interface FaturamentoItem {
  id: string
  number: string
  guestId: string
  reservationId: string
  status: string
  totalAmount: number
  paidAmount: number
  createdAt: Date
}

export interface FaturamentoSummary {
  totalFaturado: number
  totalPago: number
  totalPendente: number
  taxaInadimplencia: number
}

export interface ListarFaturamentoOutput {
  items: FaturamentoItem[]
  total: number
  summary: FaturamentoSummary
}

export class ListarFaturamentoUseCase {
  constructor(private invoiceRepo: IInvoiceRepository) {}

  async execute(input: ListarFaturamentoInput): Promise<Result<ListarFaturamentoOutput, string>> {
    const filters: InvoiceFilters = {}
    if (input.month !== undefined) filters.month = input.month
    if (input.year !== undefined) filters.year = input.year
    if (input.status) filters.status = input.status
    if (input.limit !== undefined) filters.limit = input.limit
    if (input.offset !== undefined) filters.offset = input.offset

    const invoices = await this.invoiceRepo.findByProperty(input.propertyId, filters)
    const total = await this.invoiceRepo.countByProperty(input.propertyId, filters)

    const items: FaturamentoItem[] = invoices.map(inv => ({
      id: inv.id,
      number: inv.number.value,
      guestId: inv.guestId,
      reservationId: inv.reservationId,
      status: inv.status,
      totalAmount: inv.totalAmount.toNumber(),
      paidAmount: inv.paidAmount.toNumber(),
      createdAt: inv.createdAt,
    }))

    const totalFaturado = invoices.reduce((sum, inv) => sum + inv.totalAmount.toNumber(), 0)
    const totalPago = invoices.reduce((sum, inv) => sum + inv.paidAmount.toNumber(), 0)
    const totalPendente = totalFaturado - totalPago

    const overdueInvoices = invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE || inv.status === InvoiceStatus.PARTIALLY_PAID)
    const taxaInadimplencia = total > 0
      ? Math.round((overdueInvoices.length / total) * 10000) / 100
      : 0

    return Result.ok({
      items,
      total,
      summary: {
        totalFaturado: Math.round(totalFaturado * 100) / 100,
        totalPago: Math.round(totalPago * 100) / 100,
        totalPendente: Math.round(totalPendente * 100) / 100,
        taxaInadimplencia,
      },
    })
  }
}
