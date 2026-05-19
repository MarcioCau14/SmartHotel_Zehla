import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function clean() {
  const deleted = await prisma.lead.deleteMany({});
  console.log(`DB Purged: ${deleted.count} leads removed.`);
}
clean().catch(console.error).finally(() => prisma.$disconnect());
