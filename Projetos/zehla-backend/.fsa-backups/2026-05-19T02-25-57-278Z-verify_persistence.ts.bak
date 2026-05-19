import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const count = await prisma.zMGMessage.count({ 
    where: { 
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } 
    } 
  });
  console.log('Novas Mensagens (10 min):', count);
}
run().finally(() => prisma.$disconnect());
