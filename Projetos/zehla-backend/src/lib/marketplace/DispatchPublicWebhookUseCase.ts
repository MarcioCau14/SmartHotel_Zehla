import { prisma } from '@/lib/prisma';
import { Queue } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import crypto from 'crypto';

/**
 * Use Case: Despachar Webhooks Públicos
 * 
 * Arquitetura: Event-Driven com BullMQ + HMAC-SHA256
 * 
 * Fluxo:
 * 1. Recebe evento do sistema ZEHLA (ex: "reservation.created")
 * 2. Busca assinaturas ativas do tenant para este tipo de evento
 * 3. Gera assinatura HMAC-SHA256 para cada assinatura
 * 4. Envia para fila BullMQ (zehla-public-webhooks)
 * 5. Worker processa assincronamente com retry exponencial
 * 
 * Segurança:
 * - Assinatura HMAC-SHA256 no padrão Stripe (t=timestamp,v1=signature)
 * - Cada WebhookSubscription tem secretKey único
 * - Fila isolada para tráfego externo (não compete com filas internas)
 * 
 * Custo Zero: BullMQ usa Redis existente, sem custo adicional
 */

const publicWebhookQueue = new Queue('zehla-public-webhooks', {
  connection: redisWorker,
  defaultJobOptions: {
    removeOnComplete: 50,
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

interface DispatchWebhookInput {
  propertyId: string;
  eventType: string;
  payload: any;
}

interface DispatchWebhookResult {
  status: string;
  count: number;
  queued: number;
}

export class DispatchPublicWebhookUseCase {
  async execute(input: DispatchWebhookInput): Promise<DispatchWebhookResult> {
    const { propertyId, eventType, payload } = input;

    console.log(`📡 [WEBHOOK PÚBLICO] Despachando evento ${eventType} para propriedade ${propertyId}`);

    // 1. Busca assinaturas ativas deste tenant para este evento
    const subscriptions = await prisma.webhookSubscription.findMany({
      where: {
        propertyId,
        events: { has: eventType },
        isActive: true,
        disabledAt: null,
      },
    });

    if (subscriptions.length === 0) {
      console.log(`ℹ️ [WEBHOOK PÚBLICO] Nenhuma assinatura ativa para evento ${eventType}`);
      return { status: 'SEM_ASSINATURAS', count: 0, queued: 0 };
    }

    console.log(`📡 [WEBHOOK PÚBLICO] ${subscriptions.length} assinatura(s) encontrada(s) para ${eventType}`);

    const timestamp = Date.now().toString();
    let queuedCount = 0;

    // 2. Para cada assinatura, gera HMAC e enfileira
    for (const sub of subscriptions) {
      try {
        // Cria assinatura HMAC-SHA256 (padrão Stripe)
        const payloadString = JSON.stringify(payload);
        const signedPayload = `${timestamp}.${payloadString}`;
        const signature = crypto
          .createHmac('sha256', sub.secretKey)
          .update(signedPayload)
          .digest('hex');

        // Enfileira para processamento assíncrono
        await publicWebhookQueue.add('EnviarWebhook', {
          subscriptionId: sub.id,
          propertyId,
          eventType,
          url: sub.endpointUrl,
          payload,
          headers: {
            'Content-Type': 'application/json',
            'Zehla-Signature': `t=${timestamp},v1=${signature}`,
            'Zehla-Event': eventType,
            'Zehla-Delivery-Id': crypto.randomUUID(),
          },
        }, {
          jobId: `webhook-${sub.id}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
        });

        queuedCount++;

        // Atualiza última execução
        await prisma.webhookSubscription.update({
          where: { id: sub.id },
          data: { lastTriggeredAt: new Date() },
        });

        console.log(`✅ [WEBHOOK PÚBLICO] Enfileirado para ${sub.name} (${sub.endpointUrl})`);

      } catch (error) {
        console.error(`❌ [WEBHOOK PÚBLICO] Falha ao enfileirar para ${sub.name}:`, error);
      }
    }

    return {
      status: 'ENFILEIRADO',
      count: subscriptions.length,
      queued: queuedCount,
    };
  }
}

/**
 * Helper: Despacha webhooks para eventos comuns do sistema
 * Pode ser chamado de qualquer lugar do código
 */
export async function dispatchWebhook(propertyId: string, eventType: string, payload: any) {
  const dispatcher = new DispatchPublicWebhookUseCase();
  return dispatcher.execute({ propertyId, eventType, payload });
}

/**
 * Gera secretKey único para nova assinatura de webhook
 */
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Gera API key completa (chave + hash)
 * Retorna a chave em texto plano (para exibição única) e o hash (para armazenamento)
 */
export function generateApiKey(): { plain: string; hash: string; prefix: string } {
  const randomPart = crypto.randomBytes(24).toString('hex');
  const plain = `zehla_live_sk_${randomPart}`;
  const hash = crypto.createHash('sha256').update(plain).digest('hex');
  const prefix = plain.slice(0, 16) + '...';
  return { plain, hash, prefix };
}
