import { NextRequest, NextResponse } from 'next/server'
import { FinanceiroControllerFactory } from '../../../../../../infrastructure/http/financeiro/FinanceiroControllerFactory'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const useCase = FinanceiroControllerFactory.makeProcessarEstornoUseCase()
    const result = await useCase.execute({ paymentId: id })

    if (result.isFail) {
      const status = result.error.includes('encontrado') ? 404 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: result.value.paymentId,
        invoiceId: result.value.invoiceId,
        status: result.value.status,
      },
    })
  } catch (error) {
    console.error('Payment refund error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
