import { NextRequest, NextResponse } from 'next/server'
import { verifyHmacSignature } from '../../../../infrastructure/http/auth/hmacAuth'
import { webhookRateGuard } from '../../../../lib/security/rate-limit-webhook'
import { orchestrator } from '@/lib/brain/agent-orchestrator'
import { getWhatsAppPort } from '@/infrastructure/external/evolution'
import { scanAndMaskPII } from '@/lib/security/pii-scanner'
import { prisma } from '@/lib/prisma'
import { PrismaWhatsAppMessageRepository } from '@/infrastructure/persistence/whatsapp/PrismaWhatsAppMessageRepository'

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
    const { event, data, instance } = body

    // Apenas processa mensagens recebidas (inbound) e que não são do próprio bot (fromMe === false)
    if (event === 'messages.upsert' && data?.key && !data.key.fromMe) {
      const remoteJid = data.key.remoteJid
      const phone = remoteJid?.split('@')[0]
      const pushName = data.pushName || 'Hóspede'
      
      const messageObj = data.message
      const content = (
        messageObj?.conversation ||
        messageObj?.extendedTextMessage?.text ||
        messageObj?.imageMessage?.caption ||
        ''
      ).trim()

      const propertyId = instance || 'zehla'

      if (phone && content) {
        // Log seguro higienizando PII
        const { masked: safePhone } = scanAndMaskPII(phone)
        const { masked: safeContent } = scanAndMaskPII(content)
        console.log(`[WHATSAPP WEBHOOK] Mensagem de ${safePhone}: "${safeContent}"`)

        // Processa dinamicamente via AgentOrchestrator central
        const result = await orchestrator.process({
          propertyId,
          message: content,
          context: { phone, name: pushName }
        })

        // Envia resposta via Evolution API
        const whatsAppPort = getWhatsAppPort()
        await whatsAppPort.sendText({
          to: phone,
          content: result.response,
          instanceName: propertyId
        })

        // Registra mensagem enviada na tabela de histórico
        const messageRepo = new PrismaWhatsAppMessageRepository(prisma)
        await messageRepo.createMessage({
          propertyId,
          phone,
          content: result.response,
          direction: 'OUTBOUND',
          status: 'SENT',
          agentHandled: result.agent,
          messageId: `reply_${Date.now()}`
        })
      }
    }

    // O controller de borda repassa a mensagem com sucesso
    return NextResponse.json({
      success: true,
      status: 'verified_and_processed',
      messageId: body.messageId || data?.key?.id || 'unknown'
    }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('[WHATSAPP WEBHOOK ERROR]', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
