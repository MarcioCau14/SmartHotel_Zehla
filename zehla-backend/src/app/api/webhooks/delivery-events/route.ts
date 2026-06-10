import { NextRequest, NextResponse } from 'next/server';
import { HMACValidator } from '@/infrastructure/hardening/HMACValidator';
import { webhookRateGuard } from '@/lib/security/rate-limit-webhook';
import { trackingEventsQueue } from '@/lib/queues';

/**
 * ZEHLA WEBHOOK DELIVERY EVENTS
 * Recebe eventos de status de entrega de mensagens (SENT, DELIVERED, READ, FAILED) com blindagem Zero-Trust.
 * Os eventos são enfileirados no BullMQ para processamento assíncrono mitigando exaustão de conexões no Supabase.
 */
export async function POST(req: NextRequest) {
  // 1. Defesa de Borda / Rate Limit
  const guard = await webhookRateGuard(req);
  if (guard) return guard;

  try {
    // 2. Extração do Cabeçalho de Assinatura
    const signatureHeader = req.headers.get('x-hub-signature-256') || req.headers.get('x-zehla-signature') || '';
    const signature = signatureHeader.replace('sha256=', '').trim();

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
    }

    const secret = process.env.WHATSAPP_WEBHOOK_SECRET || process.env.EVOLUTION_WEBHOOK_SECRET || 'zehla_whatsapp_webhook_secret_2026';

    // 3. Obter rawBody para validação HMAC timing-safe antes de fazer parse JSON (Fail-Fast)
    const rawBody = await req.text();

    const hmacValidator = new HMACValidator('sha256');
    const isValid = hmacValidator.verify(rawBody, signature, secret);

    if (!isValid) {
      console.warn('⚠️ [SECURITY] Webhook signature invalid. Potential tampering or spoofing.');
      return NextResponse.json({ error: 'Unauthorized Signature' }, { status: 401 });
    }

    // 4. Ingestão do Evento e Parse Seguro
    const payload = JSON.parse(rawBody);
    const { leadId, status, propriedadeId } = payload;

    if (!leadId || !status || !propriedadeId) {
      return NextResponse.json({ error: 'Bad Request: Missing required fields' }, { status: 400 });
    }

    // 5. Enfileirar o evento no BullMQ para processamento assíncrono com concorrência limitada (limite de 5)
    await trackingEventsQueue.add('process-delivery-status', {
      leadId,
      propriedadeId,
      status
    });

    return NextResponse.json({
      success: true,
      status: 'queued',
      message: 'Delivery event received and queued'
    }, { status: 202 });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('❌ [DELIVERY WEBHOOK ERROR]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
