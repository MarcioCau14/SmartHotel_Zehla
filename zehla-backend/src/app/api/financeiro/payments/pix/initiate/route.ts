import { NextRequest, NextResponse } from 'next/server'
import { FinanceiroControllerFactory } from '../../../../../../infrastructure/http/financeiro/FinanceiroControllerFactory'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceId, propertyId, amount, pixKeyType, pixKeyValue, description } = body

    if (!invoiceId || !propertyId || !amount || !pixKeyType || !pixKeyValue) {
      return NextResponse.json({
        success: false,
        error: 'invoiceId, propertyId, amount, pixKeyType e pixKeyValue são obrigatórios',
      }, { status: 400 })
    }

    const useCase = FinanceiroControllerFactory.makeProcessarPagamentoPixUseCase()
    const result = await useCase.execute({
      invoiceId,
      amount,
      pixKeyType,
      pixKeyValue,
      description: description ?? 'Pagamento via PIX',
    })

    if (result.isFail) {
      const status = result.error.includes('encontrada') ? 404 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: result.value.paymentId,
        gatewayTransactionId: result.value.gatewayTransactionId,
        qrCode: result.value.qrCode,
        qrCodeBase64: result.value.qrCodeBase64,
        copyPasteKey: result.value.copyPasteKey,
        expiration: result.value.expiration.toISOString(),
        status: result.value.status,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Pix initiate error:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
