import { NextRequest, NextResponse } from 'next/server'
import { verifyHmacSignature } from '../../../../infrastructure/http/auth/hmacAuth'
import { webhookRateGuard } from '../../../../lib/security/rate-limit-webhook'

export async function POST(request: NextRequest) {
  const guard = await webhookRateGuard(request)
  if (guard) return guard

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
