import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { redisWorker } from '@/lib/redis';

/**
 * Marketing Webhook Endpoint
 * 
 * Recebe eventos do provedor de e-mail (Resend/SendGrid):
 * - email_opened: lead abriu o e-mail
 * - email_clicked: lead clicou em um link
 * - email_bounced: e-mail foi rejeitado
 * - email_unsubscribed: lead cancelou inscrição
 * - email_delivered: e-mail foi entregue
 * 
 * Arquitetura: Event-Driven com BullMQ
 * 1. Recebe payload do provedor
 * 2. Valida e normaliza eventos
 * 3. Envia para fila BullMQ (zehla-marketing-events)
 * 4. Retorna 200 OK instantâneo
 * 
 * O MarketingEventsWorker processa assincronamente:
 * - Atualiza lead score (+5 por abertura, +15 por clique)
 * - Registra FunnelEvent no PostgreSQL
 * - Atualiza cluster do lead (COLD → WARM → HOT)
 */

const marketingQueue = new Queue('zehla-marketing-events', {
  connection: redisWorker,
  defaultJobOptions: {
    removeOnComplete: 200,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
});

// Mapeamento de eventos SendGrid/Resend para eventos ZEHLA
const EVENT_MAP: Record<string, string> = {
  'open': 'email_opened',
  'click': 'email_clicked',
  'bounce': 'email_bounced',
  'unsubscribe': 'email_unsubscribed',
  'delivered': 'email_delivered',
  'dropped': 'email_dropped',
  'deferred': 'email_deferred',
  'spamreport': 'email_spam_report',
};

// Pontuação por tipo de evento
const SCORE_DELTA: Record<string, number> = {
  'email_opened': 5,
  'email_clicked': 15,
  'email_delivered': 1,
  'email_bounced': -10,
  'email_unsubscribed': -20,
  'email_spam_report': -50,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // SendGrid envia array de eventos, Resend envia objeto único
    const events = Array.isArray(body) ? body : [body];

    let processedCount = 0;

    for (const event of events) {
      // Normalizar evento (SendGrid usa 'event', Resend usa 'type')
      const rawEventType = event.event || event.type || 'unknown';
      const eventType = EVENT_MAP[rawEventType] || `email_${rawEventType}`;
      
      // Extrair email (SendGrid usa 'email', Resend usa 'recipient')
      const email = event.email || event.recipient || event.to?.email || '';
      
      // Extrair URL clicada (para eventos de clique)
      const url = event.url || '';
      
      // Extrair ID da campanha
      const campaignId = event.campaign_id || event.sg_campaign_id || '';
      const campaignName = event.campaign_name || event.sg_campaign_name || '';
      
      // Extrair metadados
      const metadata = {
        url,
        subject: event.subject || '',
        bounce_reason: event.reason || event.status || '',
        useragent: event.useragent || event['User-Agent'] || '',
        ip: event.ip || '',
        timestamp: event.timestamp || event.created_at || new Date().toISOString(),
        raw_event: rawEventType,
      };

      const scoreDelta = SCORE_DELTA[eventType] || 0;

      // Enviar para fila BullMQ
      await marketingQueue.add('ProcessLeadEvent', {
        email,
        eventType,
        campaignId,
        campaignName,
        metadata,
        scoreDelta,
        ip: metadata.ip,
        userAgent: metadata.useragent,
        receivedAt: new Date().toISOString(),
      }, {
        jobId: `marketing-${eventType}-${email}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });

      processedCount++;
    }

    console.log(`📧 [MARKETING WEBHOOK] ${processedCount} evento(s) enfileirado(s)`);

    return NextResponse.json(
      { received: true, processed: processedCount },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ [MARKETING WEBHOOK] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar webhook' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint para verificação do webhook
 */
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge');
  if (challenge) {
    return NextResponse.json({ challenge });
  }
  return NextResponse.json({ status: 'ok', endpoint: 'marketing-webhook' });
}
