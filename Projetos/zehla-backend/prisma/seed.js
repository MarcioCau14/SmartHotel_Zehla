require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
  const hashedPassword = await bcrypt.hash('zehla2026', 10);

  // 1. Criar Usuário Admin Master
  const admin = await prisma.user.upsert({
    where: { email: 'contato@zehla.com.br' },
    update: {},
    create: {
      email: 'contato@zehla.com.br',
      name: 'Marcio Cau (Admin)',
      password: hashedPassword,
      role: 'ADMIN',
      permissions: ['all'],
    },
  });

  // 2. Criar Propriedade Master (ZEHLA HQ)
  const property = await prisma.property.upsert({
    where: { slug: 'zehla-hq' },
    update: {},
    create: {
      name: 'ZEHLA SmartHotel HQ',
      slug: 'zehla-hq',
      address: 'Imbituba, SC',
      city: 'Imbituba',
      state: 'SC',
      userId: admin.id,
      plan: 'MAX',
      status: 'ACTIVE',
      registrationNumber: '0001/PRO/SC',
    },
  });

  
  
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
