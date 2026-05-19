import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const last = await prisma.zMGMessage.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 10,
    select: { propertyId: true, status: true, createdAt: true }
  });
  console.log('Ultimas mensagens:', last);
}
run().finally(() => prisma.$disconnect());
