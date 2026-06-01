import { NextRequest, NextResponse } from 'next/server'
import { FinanceiroControllerFactory } from '../../../../../../infrastructure/http/financeiro/FinanceiroControllerFactory'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason || reason.trim().length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Motivo do cancelamento deve ter pelo menos 3 caracteres',
      }, { status: 400 })
    }

    const useCase = FinanceiroControllerFactory.makeCancelarFaturaUseCase()
    const result = await useCase.execute({ invoiceId: id, reason })

    if (result.isFail) {
      const status = result.error.includes('encontrada') ? 404 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.value.id,
        status: result.value.status,
      },
    })
  } catch (error) {
    console.error('Invoice cancel error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
