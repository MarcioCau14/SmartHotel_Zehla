import { Queue } from 'bullmq';

import { redisConfig } from './src/lib/delivery/redis-connection';


/**
 * ZEHLA WAR MACHINE: LOAD TESTER
 * Simula a entrada massiva de leads para validar resiliência e inteligência.
 */

const campaignQueue = new Queue('campaign', { connection: redisConfig });

async function runLoadTest(count: number = 100) {
  try {
  

  for (let i = 1; i <= count; i++) {
    const lead = {
      id: `lead_${i}`,
      empresa: `Pousada Teste ${i}`,
      email: `teste${i}@pousada.com.br`,
      score: Math.floor(Math.random() * 100), // Scores variados para testar o Decision Engine
      pitch_rm: 'Otimização de receita detectada via IA Zehla.'
    };

    await campaignQueue.add('new-lead', lead, {
      jobId: `job_lead_${i}` // Garantia de Idempotência no BullMQ
    });

    if (i % 10 === 0) 
  }

  
}

// Executa se chamado diretamente
if (require.main === module) {
  runLoadTest(50); // Começamos com 50 para o teste inicial solicitado
}
