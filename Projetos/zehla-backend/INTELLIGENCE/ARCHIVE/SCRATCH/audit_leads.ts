import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.lead.count();
  console.log(`TOTAL_LEADS: ${count}`);
  
  const categories = await prisma.lead.groupBy({
    by: ['cluster'],
    _count: {
      id: true
    }
  });
  console.log('CATEGORIES:', JSON.stringify(categories, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
