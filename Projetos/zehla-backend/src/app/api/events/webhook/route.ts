// src/app/api/events/webhook/route.ts — ZEHLA Brain v4: Webhook Receiver
// Recebe eventos de plataformas externas (n8n, Make, Segment, Z-API)
import { NextRequest, NextResponse } from 'next/server';
import { captureQueue } from '@/lib/queues';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Mapeamento de eventos externos para internos
const EXTERNAL_EVENT_MAP: Record<string, string> = {
  // Segment
  'Email Opened': 'EMAIL_OPEN',
  'Email Link Clicked': 'LINK_CLICK',
  'Page Viewed': 'LANDING_VISIT',
  // n8n / Make
  'email.opened': 'EMAIL_OPEN',
  'email.clicked': 'LINK_CLICK',
  'whatsapp.received': 'WHATSAPP_REPLY',
  'whatsapp.opened': 'WHATSAPP_OPEN',
  // Z-API
  'ReceivedCallback': 'WHATSAPP_REPLY',
  'MessageStatusCallback': 'WHATSAPP_OPEN',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const source = req.headers.get('x-webhook-source') || 'unknown';

    // 1. Verificação HMAC (se WEBHOOK_SECRET estiver configurado)
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-signature');
      if (signature) {
        const rawBody = JSON.stringify(body);
        const expectedSignature = 'sha256=' + crypto
          .createHmac('sha256', webhookSecret)
          .update(rawBody)
          .digest('hex');

        if (signature !== expectedSignature) {
          console.warn(`[Webhook] Assinatura HMAC inválida de ${source}`);
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
      }
    }

    // 2. Log do webhook para auditoria
    const webhookLog = await prisma.webhookLog.create({
      data: {
        source,
        eventType: body.event || body.eventType || body.type || null,
        payload: body,
        headers: Object.fromEntries(req.headers.entries()),
        status: 'received',
      },
    });

    // 3. Normalizar evento externo para interno
    const externalEventType = body.event || body.eventType || body.type || '';
    const internalEventType = EXTERNAL_EVENT_MAP[externalEventType];

    if (!internalEventType) {
      // Evento desconhecido — logar mas não processar
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: { status: 'ignored', response: `Tipo não mapeado: ${externalEventType}` },
      });

      return NextResponse.json({
        status: 'ignored',
        reason: `Tipo de evento não mapeado: ${externalEventType}`,
      }, { status: 200 });
    }

    // 4. Extrair email do payload (varia por plataforma)
    const email = body.email || body.userId || body.properties?.email ||
                  body.data?.email || body.contact?.email || body.phone;

    if (!email) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: { status: 'failed', response: 'Email não encontrado no payload' },
      });
      return NextResponse.json({ error: 'Email não encontrado no payload' }, { status: 400 });
    }

    // 5. Enfileirar na pipeline
    await captureQueue.add('capture-event', {
      email: String(email).toLowerCase().trim(),
      eventType: internalEventType,
      eventSource: `webhook:${source}`,
      metadata: {
        webhookLogId: webhookLog.id,
        rawEvent: externalEventType,
        source,
        ...body.properties,
      },
    });

    // 6. Atualizar log
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { status: 'processed', response: `Mapeado para: ${internalEventType}` },
    });

    return NextResponse.json({
      status: 'processed',
      mappedTo: internalEventType,
      webhookLogId: webhookLog.id,
    }, { status: 202 });

  } catch (error: any) {
    console.error('[Webhook] Erro:', error.message);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
