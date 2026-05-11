import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { orchestrator } from '@/lib/brain/agent-orchestrator';
import axios from 'axios';

/**
 * Worker do ZEHLA Brain para processamento assíncrono de WhatsApp.
 * Isola a carga pesada de IA do servidor de requisições HTTP.
 */
export const whatsappWorker = new Worker('whatsapp-inbound', async (job: Job) => {
  const { messageId, propertyId, phone, content, pushName } = job.data;
  const startTime = Date.now();

  try {
    console.log(`⚙️ [WORKER] Processando mensagem ${messageId} para o lead ${phone}...`);

    // 1. Chamar o Orquestrador (Aqui já roda o Semantic Cache automaticamente)
    const result = await orchestrator.process({
      propertyId,
      message: content,
      context: { phone, name: pushName }
    });

    // 2. Persistir a resposta gerada
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

    // 3. Integração com Evolution API (Disparo Real)
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;

    if (evolutionUrl && evolutionKey) {
      await axios.post(`${evolutionUrl}/message/sendText/${propertyId}`, {
        number: phone,
        options: { delay: 1200, presence: "composing" },
        textMessage: { text: result.response }
      }, {
        headers: { 'apikey': evolutionKey }
      });
      
      console.log(`📤 [WORKER] Resposta enviada via Evolution API em ${Date.now() - startTime}ms`);
    } else {
      console.warn(`⚠️ [WORKER] Evolution API não configurada. Resposta simulada: ${result.response}`);
    }

    // 4. Marcar a mensagem original como processada
    await prisma.message.update({
      where: { id: messageId },
      data: { status: 'READ' }
    });

  } catch (error) {
    console.error(`❌ [WORKER ERROR] Falha ao processar job ${job.id}:`, error);
    throw error;
  }
}, { 
  connection: redisWorker,
  concurrency: 5
});

console.log('🤖 [ZEHLA WORKER] Fila "whatsapp-inbound" ativa e aguardando jobs...');
