require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('zehla_secret_2026', 10);
  
  // Criar Usuário Admin
  const user = await prisma.user.upsert({
    where: { email: 'admin@zehla.com.br' },
    update: {},
    create: {
      email: 'admin@zehla.com.br',
      name: 'Admin Zehla',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  // Criar Propriedade de Teste vinculada ao Admin
  const property = await prisma.property.upsert({
    where: { slug: 'pousada-test-drive' },
    update: {},
    create: {
      name: 'Pousada Test Drive',
      slug: 'pousada-test-drive',
      address: 'Praia do Rosa, Imbituba, SC',
      city: 'Imbituba',
      state: 'SC',
      plan: 'MAX',
      userId: user.id,
    },
  });

  console.log({ user, property });
  console.log('✅ Usuário e Propriedade de teste criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
