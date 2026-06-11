import { NextRequest, NextResponse } from 'next/server';
import { HMACValidator } from '@/infrastructure/hardening/HMACValidator';
import { webhookRateGuard } from '@/lib/security/rate-limit-webhook';
import { trackingEventsQueue } from '@/lib/queues';

export async function POST(req: NextRequest) {
  const guard = await webhookRateGuard(req);
  if (guard) return guard;

  try {
    const signatureHeader = req.headers.get('x-hub-signature-256') || req.headers.get('x-zehla-signature') || '';
    const signature = signatureHeader.replace('sha256=', '').trim();

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
    }

    const secret = process.env.WHATSAPP_WEBHOOK_SECRET || process.env.EVOLUTION_WEBHOOK_SECRET || 'zehla_whatsapp_webhook_secret_2026';

    const rawBody = await req.text();

    const hmacValidator = new HMACValidator('sha256');
    const isValid = hmacValidator.verify(rawBody, signature, secret);
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized Signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { leadId, status, propriedadeId } = payload;

    if (!leadId || !status || !propriedadeId) {
      return NextResponse.json({ error: 'Bad Request: Missing required fields' }, { status: 400 });
    }

    await trackingEventsQueue.add('process-delivery-status', {
      leadId,
      propriedadeId,
      status
    });

    return NextResponse.json({
      success: true,
      status: 'queued',
    }, { status: 202 });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[DELIVERY WEBHOOK ERROR]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
