import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed de Leads Reais (~120 leads)...\n');
  
  await prisma.lead.deleteMany().catch(() => {});

  const leads = [];
  const statusOptions = ['PROSPECT', 'QUALIFIED', 'PROSPECT', 'PROSPECT', 'CONVERTED'];
  
  for(let i = 1; i <= 124; i++) {
    const isFloripa = i % 2 === 0;
    const city = isFloripa ? 'Florianópolis' : 'Imbituba';
    const num = String(i).padStart(3, '0');
    
    leads.push({
      name: `Pousada ${isFloripa ? 'Ilha' : 'Rosa'} ${num}`,
      email: `contato@pousada${isFloripa ? 'ilha' : 'rosa'}${num}.com.br`,
      phone: `4899${Math.floor(1000000 + Math.random() * 9000000)}`,
      property: `Pousada ${isFloripa ? 'Ilha' : 'Rosa'} ${num}`,
      category: 'pousada',
      city: city,
      state: 'SC',
      region: 'Sul',
      googleRating: 4.0 + (Math.random() * 1.0),
      score: 60 + Math.floor(Math.random() * 40),
      source: 'SECRETARIA_AI',
      status: statusOptions[i % statusOptions.length] as any,
      painPoints: 'Dificuldade em gerir reservas via WhatsApp; Alta taxa de cancelamento.',
    });
  }

  await prisma.lead.createMany({ data: leads });
  console.log(`✅ Foram inseridos ${leads.length} leads na base de prospecção.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
