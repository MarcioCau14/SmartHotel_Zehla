import { Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConfig } from '../src/lib/delivery/redis-connection';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const marketingQueue = new Queue('marketing', { connection: redisConfig });

async function startCavalariaSP() {
  console.log('🚀 [CAVALARIA ZEHLA] Iniciando Operação Bandeirante (SP)...');
  
  const topLeads = await prisma.lead.findMany({
    where: { state: 'SP', status: 'PROSPECT' },
    orderBy: [{ score: 'desc' }, { validationScore: 'desc' }],
    take: 10
  });

  console.log(`🎯 Alvos Identificados: ${topLeads.length} leads de luxo e alto impacto em SP.`);

  for (const lead of topLeads) {
    console.log(`➡️ [FILA] Adicionando: ${lead.name} (${lead.city} - ${lead.location})`);
    
    await marketingQueue.add('campaign-trigger', {
      id: lead.id,
      empresa: lead.name,
      whatsapp: lead.whatsapp,
      cidade: lead.city,
      pitch_rm: `A ZEHLA identificou que a ${lead.name} em ${lead.city} possui um perfil de excelência. Queremos mostrar como nossa IA pode otimizar suas vendas diretas no próximo feriado.`,
      score: lead.score
    });
  }

  console.log('\n✅ [CAVALARIA] Operação Bandeirante iniciada com sucesso! Processando via Marketing Worker.');
}

startCavalariaSP()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
