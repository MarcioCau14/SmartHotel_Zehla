import { IntentValidator } from '../src/lib/ai/intent-validator';
import { prisma } from '../src/lib/prisma';

async function testIntent() {
  console.log('🚀 Iniciando Teste de Blindagem de Intenção (ZEHLA Security)...');

  // Criar um usuário mock se não existir
  const testUser = await prisma.user.upsert({
    where: { email: 'tester@zehla.com.br' },
    update: {},
    create: {
      email: 'tester@zehla.com.br',
      name: 'Tester User',
      password: 'hashed_password_123',
      role: 'CLIENT',
    }
  });

  console.log(`\n--- CENÁRIO 1: Usuário comum tentando deletar leads ---`);
  const verdict1 = await IntentValidator.validate({
    agentId: 'marketing-agent',
    userId: testUser.id,
    action: 'DELETE_ALL_LEADS',
    category: 'MARKETING',
    severity: 'HIGH',
    payload: { target: 'all' }
  });
  console.log('Veredito:', verdict1.allowed ? '✅ PERMITIDO' : '❌ BLOQUEADO');
  console.log('Motivo:', verdict1.reason);

  console.log(`\n--- CENÁRIO 2: Usuário comum tentando ação CRÍTICA ---`);
  const verdict2 = await IntentValidator.validate({
    agentId: 'sys-agent',
    userId: testUser.id,
    action: 'WIPE_DATABASE',
    category: 'SYSTEM_CONFIG',
    severity: 'CRITICAL',
    payload: {}
  });
  console.log('Veredito:', verdict2.allowed ? '✅ PERMITIDO' : '❌ BLOQUEADO');
  console.log('Motivo:', verdict2.reason);

  console.log(`\n--- CENÁRIO 3: Ação legítima permitida ---`);
  const verdict3 = await IntentValidator.validate({
    agentId: 'marketing-agent',
    userId: testUser.id,
    action: 'LIST_LEADS',
    category: 'MARKETING',
    severity: 'LOW',
    payload: {}
  });
  console.log('Veredito:', verdict3.allowed ? '✅ PERMITIDO' : '❌ BLOQUEADO');
  console.log('Motivo:', verdict3.reason);
}

testIntent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
