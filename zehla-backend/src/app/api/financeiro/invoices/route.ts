import { NextRequest, NextResponse } from 'next/server'
import { FinanceiroControllerFactory } from '../../../../infrastructure/http/financeiro/FinanceiroControllerFactory'
import { InvoiceStatus } from '../../../../domain/financeiro/enums'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const status = searchParams.get('status')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'propertyId é obrigatório' }, { status: 400 })
    }

    const useCase = FinanceiroControllerFactory.makeListarFaturamentoUseCase()
    const result = await useCase.execute({
      propertyId,
      status: Object.values(InvoiceStatus).includes(status as InvoiceStatus) ? (status as InvoiceStatus) : undefined,
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    })

    if (result.isFail) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, ...result.value })
  } catch (error) {
    console.error('Invoice list error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reservationId, guestId, propertyId, startDate, endDate, items } = body

    if (!reservationId || !guestId || !propertyId || !startDate || !endDate || !items) {
      return NextResponse.json({
        success: false,
        error: 'reservationId, guestId, propertyId, startDate, endDate e items são obrigatórios',
      }, { status: 400 })
    }

    const useCase = FinanceiroControllerFactory.makeGerarFaturaUseCase()
    const result = await useCase.execute({
      reservationId,
      guestId,
      propertyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      items,
    })

    if (result.isFail) {
      const status = result.error.includes('já possui') ? 409 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 201 })
  } catch (error) {
    console.error('Invoice create error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
