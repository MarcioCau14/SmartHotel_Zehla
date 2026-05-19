import { prisma } from '@/lib/prisma';
async function run() {
  console.log('--- TESTE PRISMA MODELS ---');
  console.log('Property:', !!prisma.property);
  console.log('GuestProfile:', !!prisma.guestProfile);
  console.log('MemoryNode:', !!prisma.memoryNode);
  
  try {
    const count = await prisma.guestProfile.count();
    console.log('GuestProfile Count:', count);
  } catch (e) {
    console.error('Erro ao acessar GuestProfile:', e.message);
  }
}
run().finally(() => prisma.$disconnect());
