import { Queue, Worker, Job } from 'bullmq';
import { redisWorker } from '../redis';
import { SwipeMatcher } from '../swipe/matcher';
import { ValidatedLead, ZMGPayload } from '../types/warmup-types';
import { getWhatsAppPort } from '@/infrastructure/external/evolution';

export class ZMGDispatcher {
  private queueName = 'zmg-warmup-disparo';
  private queue: Queue;

  constructor() {
    // Configuração da Fila vinculada ao Redis DB 1 (via redisWorker)
    this.queue = new Queue(this.queueName, {
      connection: redisWorker,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 10000 },
        removeOnComplete: true,
      }
    });

    this.initializeWorker();
  }

  /**
   * Enfileira os leads validados para disparo controlado.
   * Integração Swipe: Captura a abordagem correta da Swipe Library.
   */
  async enqueueLeads(leads: ValidatedLead[]): Promise<void> {
    console.log(`🚀 [ZMG] Enfileirando ${leads.length} leads qualificados para a esteira.`);
    
    for (const lead of leads) {
      try {
        // Integração Swipe: Captura o melhor template para a dor identificada
        const template = await SwipeMatcher.getBestTemplate(lead.painType);
        
        const payload: ZMGPayload = {
          leadId: lead.id,
          whatsapp: lead.whatsapp,
          templateId: template.id,
          messageContent: template.content,
          containsOptOut: true
        };

        await this.queue.add('send-warmup', payload);
      } catch (error) {
        console.error(`[ZMG] Erro ao enfileirar lead ${lead.pousadaName}:`, (error as any).message);
      }
    }
    
    console.log(`✅ [ZMG] Enfileiramento concluído.`);
  }

  /**
   * Inicializa o Worker com Rate Limiting Militar (10 msgs/min).
   * Blindagem contra banimentos da Meta.
   */
  private initializeWorker() {
    new Worker(
      this.queueName,
      async (job: Job<ZMGPayload>) => {
        const { whatsapp, messageContent } = job.data;
        
        // LGPD Compliance: Trava de segurança obrigatória
        const finalMessage = `${messageContent}\n\n*Para não receber mais mensagens, responda PARAR*`;

        console.log(`[ZMG] [WORKER] Despachando para ${whatsapp}...`);

        try {
          const port = getWhatsAppPort();
          const result = await port.sendText({ to: whatsapp, content: finalMessage });

          if (!result.success) {
            console.error(`❌ [ZMG] [ERROR] Falha crítica para ${whatsapp}:`, result.error);
            throw new Error(result.error || 'Send failed');
          }
          
          console.log(`✅ [ZMG] [SUCCESS] Mensagem entregue para ${whatsapp}`);
        } catch (error: any) {
          const errorMsg = error.response?.data || error.message;
          console.error(`❌ [ZMG] [ERROR] Falha crítica para ${whatsapp}:`, errorMsg);
          throw error; // Trigger do BullMQ retry strategy
        }
      },
      {
        connection: redisWorker,
        // Rate Limiting Militar: 10 mensagens por minuto (60000ms)
        limiter: {
          max: 10,
          duration: 60000 
        }
      }
    );
  }
}

