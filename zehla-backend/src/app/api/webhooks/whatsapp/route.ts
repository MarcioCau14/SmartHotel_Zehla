import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Queue } from 'bullmq'
import { redisWorker } from '@/lib/redis'
import { verifyWhatsAppSignature, checkWhatsAppRateLimit } from '@/lib/security/whatsapp-shield'

// Inicialização da Fila Inbound utilizando o Redis Isolado (DB 1)
const inboundQueue = new Queue('whatsapp-inbound', { 
  connection: redisWorker,
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  }
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('X-Hub-Signature-256') || ''
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET || ''

    // Blindagem de Segurança
    if (process.env.NODE_ENV === 'production' && !verifyWhatsAppSignature(rawBody, signature, webhookSecret)) {
      console.error('🚨 [WHATSAPP SHIELD] Assinatura inválida!')
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    // Extrair dados do webhook Evolution API
    const remoteJid = body.data?.key?.remoteJid
    const messageText = body.data?.message?.conversation || body.data?.message?.extendedTextMessage?.text
    const fromMe = body.data?.key?.fromMe
    const pushName = body.data?.pushName

    if (fromMe || !messageText || !remoteJid) {
      return NextResponse.json({ success: true, ignored: true })
    }

    // Extrair número de telefone
    const phone = remoteJid.split('@')[0]

    // Rate Limiting
    const isAllowed = await checkWhatsAppRateLimit(phone)
    if (!isAllowed) {
      return NextResponse.json({ success: false, error: 'Too many messages' }, { status: 429 })
    }

    // Buscar propriedade pelo número de WhatsApp
    const property = await prisma.property.findFirst({
      where: { whatsapp: phone }
    })

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    // 1. Salvar mensagem recebida com status PENDING
    const savedMessage = await prisma.message.create({
      data: {
        propertyId: property.id,
        phone,
        name: pushName,
        content: messageText,
        direction: 'INBOUND',
        type: 'TEXT',
        status: 'PENDING'
      }
    })

    // 2. Enfileirar processamento no BullMQ (Redis DB 1)
    await inboundQueue.add('process-message', {
      messageId: savedMessage.id,
      propertyId: property.id,
      phone,
      content: messageText,
      pushName
    });

    console.log(`📥 [QUEUED] Mensagem ${savedMessage.id} de ${phone} enviada para fila.`);

    // 3. Retorno rápido (Non-blocking)
    return NextResponse.json({
      success: true,
      status: 'queued',
      messageId: savedMessage.id
    })

  } catch (error) {
    console.error('❌ Erro no webhook WhatsApp assíncrono:', error)
    return NextResponse.json({ success: false, error: 'Webhook error' }, { status: 500 })
  }
}
