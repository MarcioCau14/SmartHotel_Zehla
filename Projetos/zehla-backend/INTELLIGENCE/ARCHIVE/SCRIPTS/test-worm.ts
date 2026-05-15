import { prisma } from '../src/lib/prisma';

async function testWORM() {
  console.log('🛡️  [ZEHLA FORTRESS] Testando Princípio WORM (Bunker Financeiro)...');

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
    console.log('✅ Registro de auditoria criado:', audit.id);

    // 2. Tentar atualizar (Deve falhar)
    console.log('🛑 Tentando atualizar o registro (Deve ser bloqueado)...');
    await prisma.financialAudit.update({
      where: { id: audit.id },
      data: { amount: 200.00 }
    });

    console.log('❌ FALHA: O sistema permitiu a atualização de um registro WORM!');
  } catch (error: any) {
    if (error.message.includes('PROTEÇÃO FORTRESS')) {
      console.log('✅ SUCESSO: Bloqueio WORM ativo e funcional.');
    } else {
      console.log('❌ ERRO INESPERADO:', error.message);
    }
  }

  try {
    // 3. Tentar deletar (Deve falhar)
    console.log('🛑 Tentando deletar o registro (Deve ser bloqueado)...');
    const audit = await prisma.financialAudit.findFirst();
    if (audit) {
      await prisma.financialAudit.delete({
        where: { id: audit.id }
      });
      console.log('❌ FALHA: O sistema permitiu a deleção de um registro WORM!');
    }
  } catch (error: any) {
    if (error.message.includes('PROTEÇÃO FORTRESS')) {
      console.log('✅ SUCESSO: Deleção WORM bloqueada corretamente.');
    } else {
      console.log('❌ ERRO INESPERADO:', error.message);
    }
  }
}

testWORM().catch(console.error);
