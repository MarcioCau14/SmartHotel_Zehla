import { NextRequest, NextResponse } from 'next/server'
import { FinanceiroControllerFactory } from '../../../../../infrastructure/http/financeiro/FinanceiroControllerFactory'
import { invoiceToDTO } from '../../../../../infrastructure/http/financeiro/InvoiceDTO'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const repo = FinanceiroControllerFactory.getInvoiceRepository()
    const invoice = await repo.findById(id)

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Fatura não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: invoiceToDTO(invoice) })
  } catch (error) {
    console.error('Invoice get error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const repo = FinanceiroControllerFactory.getInvoiceRepository()
    const invoice = await repo.findById(id)

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Fatura não encontrada' }, { status: 404 })
    }

    if (body.dueDate) {
      const billingPeriod = invoice.billingPeriod
      const newBilling = new Date(body.dueDate)
      ;(invoice as any).data.billingPeriod.startDate = billingPeriod.startDate
      ;(invoice as any).data.billingPeriod.endDate = newBilling
    }

    await repo.save(invoice)

    return NextResponse.json({ success: true, data: invoiceToDTO(invoice) })
  } catch (error) {
    console.error('Invoice update error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
