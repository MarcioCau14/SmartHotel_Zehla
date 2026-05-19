import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const failed = await prisma.zMGMessage.findMany({ 
    where: { status: 'FAILED' },
    orderBy: { createdAt: 'desc' }, 
    take: 5,
    select: { failureReason: true, sentChannel: true }
  });
  console.log('Motivos de falha:', failed);
}
run().finally(() => prisma.$disconnect());
