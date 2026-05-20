import { Worker, Queue } from 'bullmq';
import { redisConfig } from '../redis-connection';

/**
 * ZEHLA DECISION WORKER
 * A primeira camada de inteligência do disparo.
 * Decide o canal, a prioridade e se o lead deve ou não ser processado.
 */

// Filas de saída
const marketingQueue = new Queue('marketing', { connection: redisConfig });
const whatsappQueue = new Queue('whatsapp', { connection: redisConfig });

export const decisionWorker = new Worker(
  'campaign',
  async (job) => {
    const lead = job.data;
    
    console.log(`🧠 [DECISION] Analisando Lead: ${lead.empresa} (Score: ${lead.score || 'N/A'})`);

    // 1. ZEHLA Decision Engine: Regras de Roteamento
    const score = lead.score || 0;

    // Leads com score muito baixo: Skip para Nurturing
    if (score < 30) {
      console.log(`⏭️ [DECISION] Lead com score baixo (${score}). Pulando disparo direto.`);
      return { action: 'skip', reason: 'low_score' };
    }

    // Leads de Elite (Score > 85): Prioridade máxima e Canal Direto
    const priority = score > 85 ? 1 : 10;
    
    // Decisão de Canal (Heurística inicial: Todo lead novo vai para E-mail para validação)
    // Se já houve interação positiva prévia, poderia ser WhatsApp
    const channel = 'email';

    if (channel === 'email') {
      await marketingQueue.add('enrich-pitch', lead, { priority });
      return { action: 'forward', queue: 'marketing', priority };
    }

    if (channel === 'whatsapp') {
      await whatsappQueue.add('send-message', lead, { priority });
      return { action: 'forward', queue: 'whatsapp', priority };
    }
  },
  { 
    connection: redisConfig,
    concurrency: 5 // Processa 5 decisões simultaneamente
  }
);

decisionWorker.on('completed', (job) => {
  console.log(`✅ [DECISION] Job ${job.id} finalizado com sucesso.`);
});

decisionWorker.on('failed', (job, err) => {
  console.error(`❌ [DECISION] Job ${job?.id} falhou:`, err);
});
