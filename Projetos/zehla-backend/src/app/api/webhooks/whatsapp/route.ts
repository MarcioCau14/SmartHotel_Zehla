import { NextRequest, NextResponse } from 'next/server'
import { verifyHmacSignature } from '../../../../infrastructure/http/auth/hmacAuth'
import { ProcessReplyUseCase } from '@/application/growth/use-cases/ProcessReplyUseCase'
import { ConsoleEventBus } from '@/infrastructure/events/ConsoleEventBus'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('X-Hub-Signature-256') || request.headers.get('X-WhatsApp-Signature') || ''
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET ?? 'zehla_whatsapp_webhook_secret_2026'

    // Validação timing-safe de assinatura HMAC
    const verificationResult = verifyHmacSignature(rawBody, signature, secret)
    if (verificationResult.isFail) {
      return NextResponse.json({ error: verificationResult.error.message }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    // Extrai o telefone e o conteúdo da mensagem para o ProcessReplyUseCase
    const { phone, content } = body

    if (phone && content) {
      const eventBus = new ConsoleEventBus()
      const useCase = new ProcessReplyUseCase(eventBus)
      const result = await useCase.execute(phone, content)
      
      if (result.isFail) {
        console.error(`[Webhook WhatsApp] Falha ao processar resposta: ${result.error.message}`)
      }
    }

    // O controller de borda repassa a mensagem com sucesso
    return NextResponse.json({
      success: true,
      status: 'verified_and_processed',
      messageId: body.messageId || 'unknown'
    }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
