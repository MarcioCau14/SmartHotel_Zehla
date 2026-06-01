import { NextRequest, NextResponse } from 'next/server'
import { FinanceiroControllerFactory } from '../../../../../../infrastructure/http/financeiro/FinanceiroControllerFactory'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const useCase = FinanceiroControllerFactory.makeEmitirFaturaUseCase()
    const result = await useCase.execute({ invoiceId: id })

    if (result.isFail) {
      const status = result.error.includes('encontrada') ? 404 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.value.id,
        number: id,
        status: result.value.status,
        issuedAt: result.value.issuedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Invoice issue error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
