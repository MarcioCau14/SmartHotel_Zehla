import { IntentValidator } from '../src/lib/ai/intent-validator';
import { prisma } from '../src/lib/prisma';


async function testIntent() {
  try {
  ...');

  // Criar um usuário mock se não existir
  const testUser = await prisma.user.upsert({
    where: { email: 'tester@zehla.com.br' },
    update: {},
    create: {
      email: 'tester@zehla.com.br',
      name: 'Tester User',
      password: process.env.TEST_USER_PASSWORD || 'DEPRECATED_DO_NOT_USE',
      role: 'CLIENT',
    }
  });

  
  const verdict1 = await IntentValidator.validate({
    agentId: 'marketing-agent',
    userId: testUser.id,
    action: 'DELETE_ALL_LEADS',
    category: 'MARKETING',
    severity: 'HIGH',
    payload: { target: 'all' }
  });
  
  

  
  const verdict2 = await IntentValidator.validate({
    agentId: 'sys-agent',
    userId: testUser.id,
    action: 'WIPE_DATABASE',
    category: 'SYSTEM_CONFIG',
    severity: 'CRITICAL',
    payload: {}
  });
  
  

  
  const verdict3 = await IntentValidator.validate({
    agentId: 'marketing-agent',
    userId: testUser.id,
    action: 'LIST_LEADS',
    category: 'MARKETING',
    severity: 'LOW',
    payload: {}
  });
  
  
}

testIntent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
