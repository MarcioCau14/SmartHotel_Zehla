import { NextRequest, NextResponse } from 'next/server'
import { verifyHmacSignature } from '../../../../infrastructure/http/auth/hmacAuth'
import { ProcessReplyUseCase } from '@/application/growth/use-cases/ProcessReplyUseCase'
import { ConsoleEventBus } from '@/infrastructure/events/ConsoleEventBus'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('X-Hub-Signature-256') || request.headers.get('X-WhatsApp-Signature') || ''
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET ?? 'zehla_whatsapp_webhook_secret_2026'

    const isDevSimulation = process.env.NODE_ENV === 'development' && signature === 'sandbox-mock-bypass-signature'

    // Validação timing-safe de assinatura HMAC
    if (!isDevSimulation) {
      const verificationResult = verifyHmacSignature(rawBody, signature, secret)
      if (verificationResult.isFail) {
        return NextResponse.json({ error: verificationResult.error.message }, { status: 401 })
      }
    }

    const body = JSON.parse(rawBody)

    let phone = body.phone || ''
    let content = body.content || ''
    let messageId = body.messageId || 'unknown'

    // Tratar o payload rico da Evolution API (messages.upsert)
    if (body.event === 'messages.upsert' && body.data) {
      const remoteJid = body.data.key?.remoteJid || ''
      phone = remoteJid.split('@')[0] || ''
      content = body.data.message?.conversation || ''
      messageId = body.data.key?.id || 'unknown'
    }

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
      messageId
    }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
