import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { orchestrator } from '@/lib/brain/agent-orchestrator';
import { ProcessPaymentProofUseCase } from '@/lib/brain/use-cases/ProcessPaymentProofUseCase';
import { ReceiptExtractor } from '@/lib/brain/receipt-extractor';
import { EmailService } from '@/lib/email/email-service';
import { getWhatsAppPort } from '@/infrastructure/external/evolution';
import { PrismaWhatsAppMessageRepository } from '@/infrastructure/persistence/whatsapp/PrismaWhatsAppMessageRepository';
import { ProcessInboundMessageUseCase } from '@/application/communication/use-cases/ProcessInboundMessageUseCase';

const useCase = new ProcessInboundMessageUseCase(
  getWhatsAppPort(),
  new PrismaWhatsAppMessageRepository(prisma),
  { process: (input) => orchestrator.process(input) },
  ReceiptExtractor,
  ProcessPaymentProofUseCase,
  async (phone: string) => prisma.lead.findFirst({ where: { phone } }),
  async (lead, content) => EmailService.sendSwipeEmail(lead, { content, tier: 'RECOVERY' }),
  async () => !!(await redisWorker.get('config:global:force_email_fallback')),
);

/**
 * Worker do ZEHLA Brain para processamento assíncrono de WhatsApp.
 * Casca fina — delega todo o fluxo ao ProcessInboundMessageUseCase.
 */
export const whatsappWorker = new Worker('whatsapp-inbound', async (job: Job) => {
  const { messageId, evolutionMessageId, propertyId, phone, content, pushName, mediaData } = job.data;

  console.log(`⚙️ [WORKER] Iniciando processamento para mensagem ${messageId}...`);

  const result = await useCase.execute({
    messageId,
    evolutionMessageId,
    propertyId,
    phone,
    content,
    pushName,
    mediaData,
  });

  return result;
}, {
  connection: redisWorker,
  concurrency: 5,
});

whatsappWorker.on('completed', (job) => {
  console.log(`✅ [WORKER] Job ${job.id} concluído com status:`, job.returnvalue?.status);
});

whatsappWorker.on('failed', (job, err) => {
  console.error(`❌ [WORKER] Job ${job?.id} falhou:`, err);
});
