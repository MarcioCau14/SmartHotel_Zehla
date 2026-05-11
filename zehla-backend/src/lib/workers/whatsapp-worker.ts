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
  const { messageId, propertyId, phone, content, pushName, mediaData } = job.data;
  const startTime = Date.now();

  try {
    console.log(`⚙️ [WORKER] Iniciando processamento para mensagem ${messageId}...`);

    // --- FEATURE 4: ROTEADOR DE MÍDIA (ESCUDO VISION) ---
    // Se for imagem ou documento, tratamos como potencial comprovante
    if (mediaData && (mediaData.type === 'imageMessage' || mediaData.type === 'documentMessage')) {
      console.log(`📸 [VISION] Mídia detectada (${mediaData.type}). Acionando ReceiptExtractor...`);

      // 1. Extração Financeira (Envia buffer/base64 ou legenda para análise)
      const receipt = await ReceiptExtractor.extract(mediaData.base64 || content || '');

      if (receipt && receipt.isConfirmed) {
        console.log(`💰 [FINANCIAL SUCCESS] Pagamento de R$ ${receipt.amount} confirmado para ${phone}`);

        // 2. Persistência de Pagamento
        await prisma.payment.create({
          data: {
            amount: receipt.amount,
            status: 'PAID',
            externalId: receipt.transactionId,
            propertyId,
            metadata: JSON.stringify(receipt)
          }
        });

        // 3. Resposta de Sucesso imediata
        const successMsg = `Recebi seu comprovante de R$ ${receipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}! 🎉 Já registrei o pagamento no sistema. Tudo certo com sua reserva!`;
        await sendWhatsAppMessage(propertyId, phone, successMsg);

        // Atualizar status da mensagem original
        await prisma.message.update({
          where: { id: messageId },
          data: { status: 'READ' }
        });

        return { status: 'COMPLETED_FINANCIAL' };
      }

      // 4. Tratar Divergência ou Fraude
      if (receipt && !receipt.isConfirmed) {
        console.warn(`🚨 [HIGH SEVERITY] Divergência financeira detectada para ${phone}`);

        await prisma.securityAlert.create({
          data: {
            tenantId: propertyId,
            alertType: 'PAYMENT_DIVERGENCE',
            severity: 'HIGH',
            metadata: JSON.stringify({ phone, receipt, messageId })
          }
        });

        const alertMsg = `Recebi a imagem, mas houve uma divergência na validação automática do valor. Nossa equipe fará a conferência manual agora mesmo e te avisamos aqui em instantes.`;
        await sendWhatsAppMessage(propertyId, phone, alertMsg);

        return { status: 'FLAGGED_SECURITY' };
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
async function sendWhatsAppMessage(propertyId: string, number: string, text: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !evolutionKey) {
    console.warn('⚠️ [EVOLUTION] API não configurada para envio real.');
    return;
  }

  // Se falhar aqui, o erro sobe e o BullMQ faz o Retry Exponencial (5 tentativas)
  await axios.post(`${evolutionUrl}/message/sendText/${propertyId}`, {
    number,
    options: { delay: 1200, presence: "composing" },
    textMessage: { text }
  }, {
    headers: { 'apikey': evolutionKey }
  });
  
  console.log(`📤 [SENT] Resposta enviada para ${number}`);
}
