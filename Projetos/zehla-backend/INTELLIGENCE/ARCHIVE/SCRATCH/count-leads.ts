import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
async function count() {
  try {
  const c = await prisma.lead.count();
  
  const byRegion = await prisma.lead.groupBy({
    by: ['region'],
    _count: true
  });
  
}
count().then(() => prisma.$disconnect());
