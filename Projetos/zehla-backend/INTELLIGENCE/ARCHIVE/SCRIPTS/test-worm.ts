import { prisma } from '../src/lib/prisma';


async function testWORM() {
  ...');

  try {
    // 1. Criar um registro de auditoria
    const audit = await prisma.financialAudit.create({
      data: {
        tenantId: 'test-tenant',
        action: 'PAYMENT_RECEIVED',
        amount: 150.00,
        source: 'TEST_SCRIPT',
        hash: 'genesis-hash'
      }
    });
    

    // 2. Tentar atualizar (Deve falhar)
    ...');
    await prisma.financialAudit.update({
      where: { id: audit.id },
      data: { amount: 200.00 }
    });

    
  } catch (error: unknown) {
    if (error.message.includes('PROTEÇÃO FORTRESS')) {
      
    } else {
      
    }
  }

  try {
    // 3. Tentar deletar (Deve falhar)
    ...');
    const audit = await prisma.financialAudit.findFirst();
    if (audit) {
      await prisma.financialAudit.delete({
        where: { id: audit.id }
      });
      
    }
  } catch (error: unknown) {
    if (error.message.includes('PROTEÇÃO FORTRESS')) {
      
    } else {
      
    }
  }
}

testWORM().catch(console.error);
