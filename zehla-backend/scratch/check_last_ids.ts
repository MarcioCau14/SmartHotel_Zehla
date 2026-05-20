import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
async function run() {
  try {
  const last = await prisma.zMGMessage.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 10,
    select: { propertyId: true, status: true, createdAt: true }
  });
  
}
run().finally(() => prisma.$disconnect());
