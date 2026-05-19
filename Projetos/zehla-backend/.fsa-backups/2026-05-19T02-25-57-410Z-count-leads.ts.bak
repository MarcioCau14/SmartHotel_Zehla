import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function count() {
  const c = await prisma.lead.count();
  console.log(`Total Leads: ${c}`);
  const byRegion = await prisma.lead.groupBy({
    by: ['region'],
    _count: true
  });
  console.log('By Region:', byRegion);
}
count().then(() => prisma.$disconnect());
