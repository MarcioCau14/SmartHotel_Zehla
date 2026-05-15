import { prisma } from '@/lib/prisma';
async function run() {
  const counts = await prisma.property.groupBy({ 
    by: ['plan'], 
    _count: true 
  });
  console.log('Distribuição de Planos:', counts);
  
  const total = await prisma.property.count();
  console.log('Total de Propriedades:', total);
}
run().finally(() => prisma.$disconnect());
