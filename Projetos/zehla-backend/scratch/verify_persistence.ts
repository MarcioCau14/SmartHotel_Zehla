import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
async function run() {
  try {
  const count = await prisma.zMGMessage.count({ 
    where: { 
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } 
    } 
  });
  :', count);
}
run().finally(() => prisma.$disconnect());
