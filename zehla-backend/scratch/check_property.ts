import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
async function run() {
  try {
  const property = await prisma.property.findFirst();
  
}
run().finally(() => prisma.$disconnect());
