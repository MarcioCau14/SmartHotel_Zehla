import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { orchestrator } from '@/lib/brain/agent-orchestrator';
import { ProcessPaymentProofUseCase } from '@/lib/brain/use-cases/ProcessPaymentProofUseCase';
import { ReceiptExtractor } from '@/lib/brain/receipt-extractor';
import { EmailService } from '@/lib/email/email-service';
import { processWhatsAppMessage } from '@/lib/brain/use-cases/ProcessWhatsAppMessageUseCase';
import axios from 'axios';

/**
 * Worker do ZEHLA Brain para processamento assíncrono de WhatsApp.
 * 
 * Architecture:
 * 1. Media Router → ReceiptExtractor → PaymentConfirmation
 * 2. Text Messages → ProcessWhatsAppMessageUseCase (MiroFish + Kimi + FinOps)
 * 3. Fallback → Legacy orchestrator (for backward compatibility)
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
        // 1. CONFRONTO FINANCEIRO (Caso de Uso Centralizado com Veda-Fraude 2.0)
        const result = await ProcessPaymentProofUseCase.execute(phone, propertyId, receipt);

        if (result.success) {
          console.log(`💰 [FINANCIAL SUCCESS] Pagamento confirmado via UseCase para ${phone.slice(-4)}`);
          const successMsg = `Recebi seu comprovante de R$ ${result.amount?.toLocaleString('pt-BR')}! 🎉 Sua reserva está confirmada.`;
          await sendWhatsAppMessage(propertyId, phone, successMsg);
        } else {
          // 🚨 DIVERGÊNCIA OU FALHA NA LOCALIZAÇÃO
          console.warn(`🚨 [HIGH SEVERITY] Falha no processamento automático para ${phone.slice(-4)}: ${result.message}`);

          await prisma.securityAlert.create({
            data: {
              tenantId: propertyId,
              alertType: 'PAYMENT_MANUAL_REVIEW_REQUIRED',
              severity: 'HIGH',
              metadata: JSON.stringify({ phone, receipt, reason: result.message })
            }
          });

          const alertMsg = `Recebi seu comprovante, mas precisei encaminhar para nossa equipe conferir manualmente (ID: ${result.message}). Em breve te aviso!`;
          await sendWhatsAppMessage(propertyId, phone, alertMsg);
        }

        // 2. EXPURGO DE MÍDIA (TTL Compliance)
        if (evolutionMessageId) {
          await deleteWhatsAppMessage(propertyId, evolutionMessageId);
        }

        return { status: 'COMPLETED_FINANCIAL' };
      }
    }

    // --- NEW: AI AGENT WITH MIROFISH CACHE + FINOPS ---
    try {
      console.log(`🧠 [AI AGENT] Processando mensagem via ProcessWhatsAppMessageUseCase...`);
      
      const aiResult = await processWhatsAppMessage({
        tenantId: propertyId,
        guestPhone: phone,
        incomingMessage: content || '',
        pushName,
      });

      console.log(`📤 [AI AGENT] Resposta gerada: source=${aiResult.source}, intent=${aiResult.intent}, tokens=${aiResult.tokensUsed}, cost=R$${aiResult.cost.toFixed(4)}, latency=${aiResult.latency}ms`);

      // Send AI response via Evolution API
      await sendWhatsAppMessage(propertyId, phone, aiResult.reply);

      // Mark original as read
      await prisma.message.updateMany({
        where: { id: messageId },
        data: { status: 'READ' },
      });

      return { status: 'COMPLETED_AI', source: aiResult.source };
    } catch (aiError) {
      console.warn(`⚠️ [AI AGENT] Failed, falling back to legacy orchestrator:`, (aiError as Error).message);
    }

    // --- FALLBACK: FLUXO DE CHAT CONVERSACIONAL (Legacy) ---
    const result = await orchestrator.process({
      propertyId,
      message: content,
      context: { phone, name: pushName }
    });

    const isEmailFallback = await redisWorker.get('config:global:force_email_fallback');

    if (isEmailFallback) {
      console.log(`✉️ [HEALED] Fallback ativo. Enviando resposta via canal de redundância para o final ${phone.slice(-4)}`);
      const lead = await prisma.lead.findFirst({ where: { phone } });
      if (lead) {
        await EmailService.sendSwipeEmail(lead, { content: result.response, tier: 'RECOVERY' });
      }
    }

    // Enviar resposta via Evolution API
    await sendWhatsAppMessage(propertyId, phone, result.response);

    // Marcar original como lida
    await prisma.message.update({
      where: { id: messageId },
      data: { status: 'READ' }
    });

  } catch (error) {
    console.error(`❌ [WORKER ERROR] Falha ao processar job ${job.id}`);
    throw error; // BullMQ Retry
  }
}, { 
  connection: redisWorker,
  concurrency: 5,
  limiter: {
    max: 30,
    duration: 1000, // 30 messages per second max
  },
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

  try {
    // Se falhar aqui, o erro sobe e o BullMQ faz o Retry Exponencial (5 tentativas)
    await axios.post(`${evolutionUrl}/message/sendText/${propertyId}`, {
      number,
      options: { delay: 1200, presence: "composing" },
      textMessage: { text }
    }, {
      headers: { 'apikey': evolutionKey }
    });
    
    console.log(`📤 [SENT] Resposta enviada com sucesso.`);
  } catch (err) {
    console.error(`❌ [EVOLUTION ERROR] Falha no envio via Evolution API.`);
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
