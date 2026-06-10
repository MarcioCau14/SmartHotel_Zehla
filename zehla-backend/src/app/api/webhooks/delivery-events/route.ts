import { NextRequest, NextResponse } from 'next/server';
import { WebhookSigner } from '@/lib/delivery/services/webhook-signer';
import { IdempotencyGuard } from '@/lib/delivery/services/idempotency-guard';
import { webhookRateGuard } from '@/lib/security/rate-limit-webhook';

/**
 * ZCC WEBHOOK RECEIVER
 * Recebe eventos da Delivery Machine (Cliques, Hot Leads, Bounces).
 */

export async function POST(req: NextRequest) {
  const guard = await webhookRateGuard(req)
  if (guard) return guard

  try {
    const signature = req.headers.get('x-zehla-signature');
    const timestamp = parseInt(req.headers.get('x-zehla-timestamp') || '0');
    const payload = await req.json();

    // 1. Validação de Blindagem (HMAC-SHA256)
    if (!signature || !WebhookSigner.verify(payload, timestamp, signature)) {
      return NextResponse.json({ error: 'Unauthorized Signature' }, { status: 401 });
    }

    // 2. Proteção contra Duplicidade (Idempotência)
    const eventId = payload.eventId || `${timestamp}-${payload.leadId}`;
    if (!(await IdempotencyGuard.canProcess(eventId))) {
      return NextResponse.json({ status: 'ignored', reason: 'duplicate' }, { status: 200 });
    }

    // 3. Processamento de Evento
    console.log(`🔥 [EVENT] Novo evento recebido: ${payload.type} para Lead ${payload.leadId}`);
    
    if (payload.type === 'HOT_LEAD_CLICK') {
      // Aqui integraria com o sistema de Alertas do SDR (WhatsApp/Dashboard)
      console.log('🚀 ACIONANDO SDR: Lead quente detectado em tempo recorde!');
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('❌ [WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
