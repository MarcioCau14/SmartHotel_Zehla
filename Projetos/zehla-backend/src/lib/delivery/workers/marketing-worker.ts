import { Worker, Queue } from 'bullmq';

import { redisConfig } from '../redis-connection';


/**
 * ZEHLA MARKETING WORKER (LLM CONTROLLED)
 * Responsável pela hiper-personalização agêntica.
 * Reescreve o Pitch RM mantendo a integridade da proposta.
 */

const deliveryQueue = new Queue('delivery', { connection: redisConfig });

export const marketingWorker = new Worker(
  'marketing',
  async (job) => {
    const lead = job.data;
    
    

    // TD4: Hiper-personalização Agêntica Controlada
    // Aqui simularíamos a chamada ao LLMRouter com as restrições (Constraints)
    const originalPitch = lead.pitch_rm || 'Proposta de otimização de receita para hotelaria.';
    
    // Prompt de Controle (Strict Constraints)
    const constraints = `
      Você é um Consultor de Revenue Management de Elite da ZEHLA.
      REESCREVA o pitch abaixo para torná-lo mais humano e direto.
      
      REGRAS INABALÁVEIS:
      - Mantenha a proposta original de lucro.
      - NÃO invente dados que não estão no texto.
      - NÃO mude o posicionamento premium.
      - Use no máximo 280 caracteres.
    `;

    // Simulação da reescrita (Em prod: const rewritten = await AgentMarketing.rewrite(originalPitch, constraints))
    const rewrittenPitch = `[AGÊNTICO] ${originalPitch}`; 

    // Encaminha para a fila de entrega final
    const enrichedLead = { ...lead, final_pitch: rewrittenPitch };
    
    await deliveryQueue.add('send-email', enrichedLead);
    
    return { status: 'enriched', lead_id: lead.id };
  },
  { 
    connection: redisConfig,
    concurrency: 2 // LLM é pesado, limitamos a concorrência
  }
);
