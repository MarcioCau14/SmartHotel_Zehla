import { NextRequest, NextResponse } from 'next/server'
import { verifyHmacSignature } from '../../../../../infrastructure/http/auth/hmacAuth'
import { ComercialControllerFactory } from '../../../../../infrastructure/http/comercial/ComercialControllerFactory'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('X-Webhook-Signature') || ''
    const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? 'zehla_payment_webhook_secret_2026'

    const verificationResult = verifyHmacSignature(rawBody, signature, secret)
    if (verificationResult.isFail) {
      return NextResponse.json({ error: verificationResult.error.message }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { leadId, propostaId, valorSinal, plano } = body

    if (!leadId || !propostaId || !valorSinal || !plano) {
      return NextResponse.json({ error: 'Campos obrigatórios: leadId, propostaId, valorSinal, plano' }, { status: 400 })
    }

    const useCase = ComercialControllerFactory.makeRegistrarPagamentoSinalUseCase()
    const result = await useCase.execute({ leadId, propostaId, valorSinal, plano })

    if (result.isFail) {
      const mensagem = result.error.message
      if (mensagem.includes('TRANSICAO_INVALIDA') || mensagem.includes('TRANSICAO_NAO_MAPEADA')) {
        return NextResponse.json({ error: mensagem }, { status: 422 })
      }
      return NextResponse.json({ error: mensagem }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: { id: result.value.id, estado: result.value.estado } }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
