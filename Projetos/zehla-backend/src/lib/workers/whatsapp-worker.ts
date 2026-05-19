import axios from 'axios';
import { Worker, Job } from 'bullmq';

import { EmailService } from '@/lib/email/email-service';
import { ProcessPaymentProofUseCase } from '@/lib/brain/use-cases/ProcessPaymentProofUseCase';
import { ReceiptExtractor } from '@/lib/brain/receipt-extractor';
import { orchestrator } from '@/lib/brain/agent-orchestrator';
import { prisma } from '@/lib/prisma';
import { redisWorker } from '@/lib/redis';


/**
 * Worker do ZEHLA Brain para processamento assíncrono de WhatsApp.
 * Implementa Roteador de Mídia para Confirmação Autônoma de Pagamento.
 */
export const whatsappWorker = new Worker('whatsapp-inbound', async (job: Job) => {
  const { messageId, evolutionMessageId, propertyId, phone, content, pushName, mediaData } = job.data;
  const startTime = Date.now();

  try {
    

    // --- FEATURE 4: ROTEADOR DE MÍDIA (ESCUDO VISION) ---
    if (mediaData && (mediaData.type === 'imageMessage' || mediaData.type === 'documentMessage')) {
      

      const receipt = await ReceiptExtractor.extract(mediaData.base64 || content || '');

      if (receipt && receipt.isConfirmed) {
        // 1. CONFRONTO FINANCEIRO (Caso de Uso Centralizado com Veda-Fraude 2.0)
        const result = await ProcessPaymentProofUseCase.execute(phone, propertyId, receipt);

        if (result.success) {
          }`);
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

    // --- FALLBACK: FLUXO DE CHAT CONVERSACIONAL ---
    // Gerar resposta da IA primeiro
    const result = await orchestrator.process({
      propertyId,
      message: content,
      context: { phone, name: pushName }
    });

    const isEmailFallback = await redisWorker.get('config:global:force_email_fallback');

    if (isEmailFallback) {
      }`);
      const lead = await prisma.lead.findFirst({ where: { phone } });
      if (lead) {
        await EmailService.sendSwipeEmail(lead, { content: result.response, tier: 'RECOVERY' });
      }
    }

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
    console.error(`❌ [WORKER ERROR] Falha ao processar job ${job.id}`);
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

  try {
    // Se falhar aqui, o erro sobe e o BullMQ faz o Retry Exponencial (5 tentativas)
    await axios.post(`${evolutionUrl}/message/sendText/${propertyId}`, {
      number,
      options: { delay: 1200, presence: "composing" },
      textMessage: { text }
    }, {
      headers: { 'apikey': evolutionKey }
    });
    
    
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
    
  } catch (err) {
    console.warn(`⚠️ [CLEANUP FAIL] Não foi possível excluir a mídia ${messageId}`);
  }
}
