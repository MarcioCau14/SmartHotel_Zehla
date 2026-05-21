import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

/**
 * Worker de Webhooks Públicos
 * 
 * Processa a fila 'zehla-public-webhooks' enviando eventos
 * para servidores de terceiros com:
 * - Retry exponencial (5s, 10s, 20s, 40s, 80s)
 * - Timeout de 10 segundos por requisição
 * - Logging completo de cada tentativa
 * - Desabilitação automática após 10 falhas consecutivas
 */

const MAX_FAILURES = 10;
const REQUEST_TIMEOUT = 10000; // 10 segundos

export const publicWebhookWorker = new Worker('zehla-public-webhooks', async (job: Job) => {
  const { subscriptionId, propertyId, eventType, url, payload, headers } = job.data;

  console.log(`📤 [WORKER WEBHOOK] Enviando ${eventType} para ${url}`);

  const startTime = Date.now();

  try {
    const response = await axios.post(url, payload, {
      headers,
      timeout: REQUEST_TIMEOUT,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    const responseTime = Date.now() - startTime;

    // Log de entrega bem-sucedida
    await prisma.webhookDeliveryLog.create({
      data: {
        subscriptionId,
        propertyId,
        eventType,
        endpointUrl: url,
        payload: JSON.parse(JSON.stringify(payload)),
        responseStatus: response.status,
        responseBody: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        responseTime,
        signature: headers['Zehla-Signature'],
        status: 'entregue',
        attempt: job.attemptsMade + 1,
      },
    });

    // Resetar contador de falhas da assinatura
    await prisma.webhookSubscription.update({
      where: { id: subscriptionId },
      data: {
        lastStatus: 'sucesso',
        failureCount: 0,
      },
    });

    console.log(`✅ [WORKER WEBHOOK] Entregue em ${responseTime}ms (status ${response.status})`);

    return { status: 'entregue', responseTime, statusCode: response.status };

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const statusCode = error.response?.status || (isTimeout ? 408 : 0);
    const errorMessage = isTimeout ? 'Timeout' : error.response?.data?.message || error.message;

    console.warn(`⚠️ [WORKER WEBHOOK] Falha ao enviar para ${url}: ${errorMessage}`);

    // Log de falha
    await prisma.webhookDeliveryLog.create({
      data: {
        subscriptionId,
        propertyId,
        eventType,
        endpointUrl: url,
        payload: JSON.parse(JSON.stringify(payload)),
        responseStatus: statusCode,
        responseBody: errorMessage,
        responseTime,
        signature: headers['Zehla-Signature'],
        status: 'falha',
        error: errorMessage,
        attempt: job.attemptsMade + 1,
        maxAttempts: 5,
        nextRetryAt: job.timestamp ? new Date(job.timestamp + Math.pow(2, job.attemptsMade) * 5000) : undefined,
      },
    });

    // Incrementar contador de falhas da assinatura
    const subscription = await prisma.webhookSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (subscription) {
      const newFailureCount = (subscription.failureCount || 0) + 1;

      if (newFailureCount >= MAX_FAILURES) {
        // Desabilitar assinatura automaticamente após muitas falhas
        await prisma.webhookSubscription.update({
          where: { id: subscriptionId },
          data: {
            isActive: false,
            disabledAt: new Date(),
            lastStatus: 'desabilitado_excesso_falhas',
            failureCount: newFailureCount,
          },
        });

        console.error(`🚨 [WORKER WEBHOOK] Assinatura ${subscriptionId} desabilitada após ${newFailureCount} falhas consecutivas`);
      } else {
        await prisma.webhookSubscription.update({
          where: { id: subscriptionId },
          data: {
            lastStatus: 'falha',
            failureCount: newFailureCount,
          },
        });
      }
    }

    // Lançar erro para BullMQ fazer retry
    throw new Error(`Falha ao enviar webhook: ${errorMessage}`);
  }
}, {
  connection: redisWorker,
  concurrency: 5, // Processa 5 webhooks em paralelo
});

console.log('🚀 [WORKER WEBHOOK] Worker de webhooks públicos iniciado');
