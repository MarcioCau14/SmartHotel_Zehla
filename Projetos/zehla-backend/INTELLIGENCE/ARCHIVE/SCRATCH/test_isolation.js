require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { AsyncLocalStorage } = require('node:async_hooks');

// Simular o Tenant Context
const tenantStorage = new AsyncLocalStorage();
const prismaBase = new PrismaClient();

// Configurar o mesmo middleware do src/lib/prisma.ts
const prisma = prismaBase.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const context = tenantStorage.getStore();
        const tenantId = context?.tenantId;

        if (tenantId && ['findMany', 'findFirst', 'create'].includes(operation)) {
          const propertyModels = ['Lead', 'Property'];
          if (propertyModels.includes(model)) {
            if (operation === 'create') {
              args.data.propertyId = tenantId;
            } else {
              args.where = { ...args.where, propertyId: tenantId };
            }
          }
        }
        return query(args);
      },
    },
  },
});

async function runTest() {
  console.log('🚀 Iniciando Teste de Isolamento Militarizado...');

  const TENANT_A = 'tenant_alpha_123';
  const TENANT_B = 'tenant_beta_456';

  // 0. Preparar Propriedades (Necessário para FK)
  await prisma.property.upsert({
    where: { id: TENANT_A },
    update: {},
    create: { id: TENANT_A, name: 'Prop Alpha', slug: 'prop-alpha', city: 'A', state: 'SC', address: 'Rua Alpha, 1' }
  });
  await prisma.property.upsert({
    where: { id: TENANT_B },
    update: {},
    create: { id: TENANT_B, name: 'Prop Beta', slug: 'prop-beta', city: 'B', state: 'SC', address: 'Rua Beta, 2' }
  });

  // 1. Criar Lead para Tenant A
  await tenantStorage.run({ tenantId: TENANT_A }, async () => {
    await prisma.lead.create({
      data: { name: 'Pousada do Alpha', whatsapp: '5511999999999' }
    });
    console.log('✅ Lead criado para TENANT A');
  });

  // 2. Criar Lead para Tenant B
  await tenantStorage.run({ tenantId: TENANT_B }, async () => {
    await prisma.lead.create({
      data: { name: 'Hotel do Beta', whatsapp: '5511888888888' }
    });
    console.log('✅ Lead criado para TENANT B');
  });

  // 3. Tentar ler leads do Tenant A (Não deve ver o do B)
  await tenantStorage.run({ tenantId: TENANT_A }, async () => {
    const leads = await prisma.lead.findMany();
    console.log(`📊 Tenant A vê ${leads.length} leads. (Esperado: 1)`);
    if (leads.length === 1 && leads[0].name === 'Pousada do Alpha') {
      console.log('🛡️ ISOLAMENTO TENANT A: OK');
    } else {
      console.error('❌ FALHA NO ISOLAMENTO TENANT A');
    }
  });

  // 4. Tentar ler leads do Tenant B (Não deve ver o do A)
  await tenantStorage.run({ tenantId: TENANT_B }, async () => {
    const leads = await prisma.lead.findMany();
    console.log(`📊 Tenant B vê ${leads.length} leads. (Esperado: 1)`);
    if (leads.length === 1 && leads[0].name === 'Hotel do Beta') {
      console.log('🛡️ ISOLAMENTO TENANT B: OK');
    } else {
      console.error('❌ FALHA NO ISOLAMENTO TENANT B');
    }
  });
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
