import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
  try {
  const count = await prisma.lead.count();
  
  
  const categories = await prisma.lead.groupBy({
    by: ['cluster'],
    _count: {
      id: true
    }
  });
  );
}

main().catch(console.error).finally(() => prisma.$disconnect());
