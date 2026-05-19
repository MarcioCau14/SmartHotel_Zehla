import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackBlastEvent } from '@/services/blast/brain-integration';

import { verifyWhatsAppSignature } from '@/lib/security/whatsapp-shield';
import { scanPII } from '@/lib/security/pii-scanner';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('X-Hub-Signature-256') || req.headers.get('x-evolution-signature');
    const webhookSecret = process.env.EVOLUTION_WEBHOOK_SECRET || process.env.EVOLUTION_API_KEY;

    // SEC-01: Validar Assinatura HMAC
    if (signature && webhookSecret) {
      const isValid = verifyWhatsAppSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.warn(`⚠️ [SECURITY] Webhook signature invalid. Possible spoofing attempt.`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    
    // Evolution API Webhook Pattern
    const { event, data, instance } = body;
    const remoteJid = data?.key?.remoteJid || data?.remoteJid;
    const phone = remoteJid?.split('@')[0];

    if (!phone) return NextResponse.json({ skipped: true });

    // 1. Detecção de Respostas e Opt-Out (Section 3.3 Rule 6)
    if (event === 'messages.upsert') {
      const message = data.message;
      const text = (message?.conversation || message?.extendedTextMessage?.text || '').trim();
      
      if (!text) return NextResponse.json({ skipped: true });

      // Verificar Palavras-Chave de Opt-Out
      const optOutKeywords = ['SAIR', 'PARAR', 'CANCELAR', 'REMOVER', 'STOP', 'UNSUBSCRIBE'];
      const isOptOut = optOutKeywords.some(kw => text.toUpperCase().includes(kw));

      // Localizar mensagem original da campanha
      const lastSentMessage = await prisma.blastMessage.findFirst({
        where: {
          contactPhone: phone,
          status: { in: ['sent', 'delivered', 'read'] }
        },
        orderBy: { sentAt: 'desc' }
      });

      if (lastSentMessage) {
        if (isOptOut) {
          const { sanitized: safeText } = scanPII(text);
          const { sanitized: safePhone } = scanPII(phone);
          console.log(`🔕 [WEBHOOK] Opt-out detectado para ${safePhone}: "${safeText}"`);
          await trackBlastEvent({
            messageId: lastSentMessage.id,
            contactPhone: phone,
            eventType: 'whatsapp_opted_out',
            campaignId: lastSentMessage.campaignId,
            content: text,
            leadId: lastSentMessage.leadId || undefined
          });
        } else {
          await trackBlastEvent({
            messageId: lastSentMessage.id,
            contactPhone: phone,
            eventType: 'whatsapp_reply',
            campaignId: lastSentMessage.campaignId,
            content: text,
            leadId: lastSentMessage.leadId || undefined
          });
        }

        return NextResponse.json({ processed: true, type: isOptOut ? 'opt_out' : 'reply' });
      }
    }

    // 2. Tracking de Entrega e Leitura (Section 5.1 Table 7)
    if (event === 'messages.update') {
      const status = data.status;
      const messageId = data.key.id;
      
      // Localizar a mensagem pelo metaMessageId (ID retornado pelo WhatsApp)
      // Nota: No Evolution, o data.key.id é o ID da mensagem
      const blastMessage = await prisma.blastMessage.findFirst({
        where: { metaMessageId: messageId }
      });

      if (blastMessage) {
        // Status 2 = Entregue, Status 3 = Lido (Depende da versão do Evolution/WhatsApp)
        if (status === 2 || status === 'DELIVERED') {
          await trackBlastEvent({
            messageId: blastMessage.id,
            contactPhone: blastMessage.contactPhone,
            eventType: 'whatsapp_delivered',
            campaignId: blastMessage.campaignId,
            leadId: blastMessage.leadId || undefined
          });
        } else if (status === 3 || status === 'READ') {
          await trackBlastEvent({
            messageId: blastMessage.id,
            contactPhone: blastMessage.contactPhone,
            eventType: 'whatsapp_open',
            campaignId: blastMessage.campaignId,
            leadId: blastMessage.leadId || undefined
          });
        }
        
        return NextResponse.json({ processed: true, type: 'status_update' });
      }
    }

    // 3. Fallback para falhas
    if (event === 'messages.delete' || (event === 'messages.update' && data.status === 'ERROR')) {
       // Opcional: Tratar falhas de entrega específicas
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
