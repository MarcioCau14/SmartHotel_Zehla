import { Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConfig } from '../src/lib/delivery/redis-connection';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const marketingQueue = new Queue('marketing', { connection: redisConfig });

async function startCavalariaRJ() {
  console.log('🚀 [CAVALARIA ZEHLA] Iniciando Operação Fluminense...');
  
  const topLeads = await prisma.lead.findMany({
    where: { state: 'RJ', status: 'PROSPECT' },
    orderBy: [{ score: 'desc' }, { validationScore: 'desc' }],
    take: 10
  });

  console.log(`🎯 Alvos Identificados: ${topLeads.length} leads de alto impacto.`);

  for (const lead of topLeads) {
    console.log(`➡️ [FILA] Adicionando: ${lead.name} (${lead.city})`);
    
    // Simulação do payload esperado pelo marketing-worker
    await marketingQueue.add('campaign-trigger', {
      id: lead.id,
      empresa: lead.name,
      whatsapp: lead.whatsapp,
      cidade: lead.city,
      pitch_rm: `Vimos que a ${lead.name} tem um potencial incrível em ${lead.city}. A ZEHLA pode ajudar a reduzir suas comissões de OTAs imediatamente.`,
      score: lead.score
    });
  }

  console.log('\n✅ [CAVALARIA] Operação iniciada com sucesso! Os leads estão sendo processados pelo Marketing Worker.');
}

startCavalariaRJ()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
