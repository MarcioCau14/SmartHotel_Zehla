import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const scLeads = await prisma.lead.count({
    where: { state: 'SC' }
  });

  const leadsByState = await prisma.lead.groupBy({
    by: ['state'],
    _count: {
      _all: true
    }
  });

  const topCities = await prisma.lead.groupBy({
    by: ['city', 'state'],
    where: { state: 'SC' },
    _count: {
      _all: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 10
  });

  console.log('--- Resumo de Leads ---');
  console.log('Total SC:', scLeads);
  console.log('Distribuição por Estado:', JSON.stringify(leadsByState, null, 2));
  console.log('Top Cidades SC:', JSON.stringify(topCities, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
