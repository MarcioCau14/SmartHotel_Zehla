import { NextRequest, NextResponse } from 'next/server'
import { FinanceiroControllerFactory } from '../../../../infrastructure/http/financeiro/FinanceiroControllerFactory'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gateway, event, payload } = body

    if (!payload || !payload.endToEndId || !payload.gatewayTransactionId) {
      return NextResponse.json({ success: true, status: 'invalid_payload' })
    }

    const useCase = FinanceiroControllerFactory.makeConciliarTransacaoPixUseCase()
    const result = await useCase.execute({
      endToEndId: payload.endToEndId,
      gatewayTransactionId: payload.gatewayTransactionId,
      amount: payload.amount ?? 0,
      status: payload.status ?? 'CONFIRMED',
    })

    if (result.isFail) {
      console.warn('PIX webhook reconciliation failed:', result.error)
      return NextResponse.json({ success: true, status: 'ignored_error', error: result.error })
    }

    return NextResponse.json({
      success: true,
      status: result.value.result === 'duplicate_ignored' ? 'duplicate_ignored' : 'processed',
    })
  } catch (error) {
    console.error('PIX webhook error:', error)
    return NextResponse.json({ success: true, status: 'internal_error' })
  }
}
