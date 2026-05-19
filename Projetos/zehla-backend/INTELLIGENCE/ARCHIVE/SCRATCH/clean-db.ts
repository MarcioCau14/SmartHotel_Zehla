import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
async function clean() {
  try {
  const deleted = await prisma.lead.deleteMany({});
  
}
clean().catch(console.error).finally(() => prisma.$disconnect());
