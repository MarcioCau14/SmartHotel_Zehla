import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { orchestrator } from '@/lib/brain/agent-orchestrator';
import { ReceiptExtractor } from '@/lib/brain/receipt-extractor';
import axios from 'axios';

/**
 * Worker do ZEHLA Brain para processamento assíncrono de WhatsApp.
 * Implementa Roteador de Mídia para Confirmação Autônoma de Pagamento.
 */
export const whatsappWorker = new Worker('whatsapp-inbound', async (job: Job) => {
  const { messageId, evolutionMessageId, propertyId, phone, content, pushName, mediaData } = job.data;
  const startTime = Date.now();

  try {
    console.log(`⚙️ [WORKER] Iniciando processamento para mensagem ${messageId}...`);

    // --- FEATURE 4: ROTEADOR DE MÍDIA (ESCUDO VISION) ---
    if (mediaData && (mediaData.type === 'imageMessage' || mediaData.type === 'documentMessage')) {
      console.log(`📸 [VISION] Mídia detectada. Acionando ReceiptExtractor...`);

      const receipt = await ReceiptExtractor.extract(mediaData.base64 || content || '');

      if (receipt && receipt.isConfirmed) {
        // 1. CONFRONTO FINANCEIRO (Veda-Fraude)
        const reservation = await prisma.reservation.findFirst({
          where: { propertyId, guestPhone: phone, status: 'PENDING_PAYMENT' },
          orderBy: { createdAt: 'desc' }
        });

        const isAmountMatch = reservation && Math.abs(receipt.amount - reservation.totalPrice) < 0.01;

        if (isAmountMatch && reservation) {
          console.log(`💰 [FINANCIAL SUCCESS] Valor exato confirmado: R$ ${receipt.amount}`);

          await prisma.payment.create({
            data: {
              amount: receipt.amount,
              status: 'PAID',
              externalId: receipt.transactionId,
              propertyId,
              reservationId: reservation.id,
              metadata: JSON.stringify(receipt)
            }
          });

          await prisma.reservation.update({
            where: { id: reservation.id },
            data: { status: 'PAID' }
          });

          const successMsg = `Recebi seu comprovante de R$ ${receipt.amount.toLocaleString('pt-BR')}! 🎉 Sua reserva está confirmada.`;
          await sendWhatsAppMessage(propertyId, phone, successMsg);
        } else {
          // 🚨 DIVERGÊNCIA OU FRAUDE DETECTADA
          console.warn(`🚨 [HIGH SEVERITY] Fraude ou divergência para ${phone}. Esperado: ${reservation?.totalPrice} | Recebido: ${receipt.amount}`);

          await prisma.securityAlert.create({
            data: {
              tenantId: propertyId,
              alertType: 'PAYMENT_FRAUD_ATTEMPT',
              severity: 'HIGH',
              metadata: JSON.stringify({ phone, expected: reservation?.totalPrice, received: receipt.amount, receipt })
            }
          });

          const alertMsg = `Houve uma divergência no valor do seu comprovante. Nossa equipe fará a conferência manual agora mesmo.`;
          await sendWhatsAppMessage(propertyId, phone, alertMsg);
        }

        // 2. EXPURGO DE MÍDIA (TTL Compliance)
        if (evolutionMessageId) {
          await deleteWhatsAppMessage(propertyId, evolutionMessageId);
        }

        return { status: 'COMPLETED_FINANCIAL' };
      }
    }

    // --- FALLBACK: FLUXO DE CHAT CONVERSACIONAL ---
    // Se não for mídia ou se o extrator falhar, cai na IA generativa
    const result = await orchestrator.process({
      propertyId,
      message: content,
      context: { phone, name: pushName }
    });

    // Persistir a resposta
    await prisma.message.create({
      data: {
        propertyId,
        phone,
        content: result.response,
        direction: 'OUTBOUND',
        status: 'SENT',
        agentHandled: result.agent
      }
    });

    // Enviar resposta via Evolution API
    await sendWhatsAppMessage(propertyId, phone, result.response);

    // Marcar original como lida
    await prisma.message.update({
      where: { id: messageId },
      data: { status: 'READ' }
    });

  } catch (error) {
    console.error(`❌ [WORKER ERROR] Falha ao processar job ${job.id}:`, error);
    throw error; // BullMQ Retry
  }
}, { 
  connection: redisWorker,
  concurrency: 5
});

/**
 * Envia mensagem de texto via Evolution API
 */
    console.log(`📤 [SENT] Resposta enviada para ${number}`);
  } catch (err) {
    console.error(`❌ [EVOLUTION ERROR] Falha ao enviar para ${number}:`, err);
    throw err; // Força o Retry do BullMQ
  }
}

/**
 * Exclui a mídia da Evolution API após o processamento (TTL de Segurança)
 */
async function deleteWhatsAppMessage(propertyId: string, messageId: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !evolutionKey) return;

  try {
    // A Evolution API geralmente permite deletar mensagens via DELETE ou endpoint específico
    await axios.delete(`${evolutionUrl}/chat/deleteMessage/${propertyId}`, {
      data: { key: { id: messageId } },
      headers: { 'apikey': evolutionKey }
    });
    console.log(`🧹 [CLEANUP] Mídia ${messageId} expurgada do servidor.`);
  } catch (err) {
    console.warn(`⚠️ [CLEANUP FAIL] Não foi possível excluir a mídia ${messageId}`);
  }
}
