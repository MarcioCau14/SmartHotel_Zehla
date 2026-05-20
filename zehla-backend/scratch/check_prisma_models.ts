import { prisma } from '@/lib/prisma';


async function run() {
  
  
  
  
  
  try {
    const count = await prisma.guestProfile.count();
    
  } catch (e) {
    console.error('Erro ao acessar GuestProfile:', e.message);
  }
}
run().finally(() => prisma.$disconnect());
