import { Invoice } from '../../../domain/financeiro/entities/Invoice'

export interface InvoiceResponseDTO {
  id: string
  number: string
  guestId: string
  reservationId: string
  status: string
  totalAmount: number
  paidAmount: number
  remainingBalance: number
  items: InvoiceItemDTO[]
  issuedAt: string | null
  cancelledAt: string | null
  cancelReason: string | null
  overdueAt: string | null
  createdAt: string
}

export interface InvoiceItemDTO {
  id: string
  description: string
  type: string
  unitPrice: number
  quantity: number
  totalPrice: number
}

export function invoiceToDTO(invoice: Invoice): InvoiceResponseDTO {
  return {
    id: invoice.id,
    number: invoice.number.value,
    guestId: invoice.guestId,
    reservationId: invoice.reservationId,
    status: invoice.status,
    totalAmount: invoice.totalAmount.toNumber(),
    paidAmount: invoice.paidAmount.toNumber(),
    remainingBalance: invoice.remainingBalance().toNumber(),
    items: invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      type: item.type,
      unitPrice: item.unitPrice.toNumber(),
      quantity: item.quantity,
      totalPrice: item.totalPrice.toNumber(),
    })),
    issuedAt: invoice.issuedAt?.toISOString() ?? null,
    cancelledAt: invoice.cancelledAt?.toISOString() ?? null,
    cancelReason: invoice.cancelReason,
    overdueAt: invoice.overdueAt?.toISOString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
  }
}
