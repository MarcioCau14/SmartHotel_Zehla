import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Queue } from 'bullmq'
import { redisWorker } from '@/lib/redis'
import { verifyWhatsAppSignature, checkWhatsAppRateLimit } from '@/lib/security/whatsapp-shield'

// Inicialização da Fila Inbound (Redis DB 1)
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

    if (process.env.NODE_ENV === 'production' && !verifyWhatsAppSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const data = body.data;

    // Extrair dados da Evolution API
    const remoteJid = data?.key?.remoteJid
    const fromMe = data?.key?.fromMe
    const pushName = data?.pushName
    
    // Capturar Texto ou Legenda de Mídia
    const messageText = data?.message?.conversation || 
                        data?.message?.extendedTextMessage?.text || 
                        data?.message?.imageMessage?.caption || 
                        data?.message?.documentMessage?.caption || "";

    // Identificar Mídia (Imagens ou Documentos)
    const imageMessage = data?.message?.imageMessage;
    const documentMessage = data?.message?.documentMessage;
    const hasMedia = !!(imageMessage || documentMessage);

    // Se não tiver texto nem mídia, ignoramos
    if (fromMe || (!messageText && !hasMedia) || !remoteJid) {
      return NextResponse.json({ success: true, ignored: true })
    }

    const phone = remoteJid.split('@')[0]
    const isAllowed = await checkWhatsAppRateLimit(phone)
    if (!isAllowed) return NextResponse.json({ success: false, error: 'Rate limit' }, { status: 429 })

    const property = await prisma.property.findFirst({ where: { whatsapp: phone } })
    if (!property) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // 1. Salvar mensagem com metadados de mídia
    const savedMessage = await prisma.message.create({
      data: {
        propertyId: property.id,
        phone,
        name: pushName,
        content: messageText || (hasMedia ? "[MÍDIA]" : ""),
        direction: 'INBOUND',
        type: hasMedia ? 'MEDIA' : 'TEXT',
        status: 'PENDING'
      }
    })

    // 2. Enfileirar com dados para o Vision (Base64 ou URL se disponível)
    await inboundQueue.add('process-message', {
      messageId: savedMessage.id,
      propertyId: property.id,
      phone,
      content: messageText,
      pushName,
      mediaData: hasMedia ? {
        type: imageMessage ? 'imageMessage' : 'documentMessage',
        mimetype: imageMessage?.mimetype || documentMessage?.mimetype,
        // Em produção, o buffer viria do download da Evolution API
        base64: imageMessage?.url || documentMessage?.url // Placeholder para URL da mídia
      } : null
    });

    console.log(`📥 [QUEUED] Mensagem ${savedMessage.id} (${hasMedia ? 'MÍDIA' : 'TEXTO'}) de ${phone}`);

    return NextResponse.json({ success: true, status: 'queued' })

  } catch (error) {
    console.error('❌ Erro no webhook WhatsApp:', error)
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 })
  }
}
