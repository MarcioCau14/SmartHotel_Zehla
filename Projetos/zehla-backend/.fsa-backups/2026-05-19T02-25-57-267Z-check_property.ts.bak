import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const property = await prisma.property.findFirst();
  console.log('Primeira Pousada encontrada:', property);
}
run().finally(() => prisma.$disconnect());
