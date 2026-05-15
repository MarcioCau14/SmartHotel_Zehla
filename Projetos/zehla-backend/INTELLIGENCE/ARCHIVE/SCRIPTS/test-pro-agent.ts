import { WhatsappAgentService } from '../src/lib/brain/whatsapp-agent-service';
import { prisma } from '../src/lib/prisma';
import { Plan } from '@prisma/client';

async function testProAgent() {
  console.log('🧪 Iniciando teste do Agente PRO...');

  // 1. Buscar ou criar usuário admin para vincular à propriedade
  let user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test-admin@zehla.ai',
        name: 'Test Admin',
        password: 'password123',
        role: 'SUPER_ADMIN'
      }
    });
  }

  // 2. Criar ou buscar uma propriedade PRO para teste
  let property = await prisma.property.findFirst({ where: { plan: Plan.PRO } });
  
  if (!property) {
    console.log('📝 Criando propriedade PRO de teste...');
    property = await prisma.property.create({
      data: {
        name: 'Villa del Mar Test',
        slug: 'villa-test-' + Date.now(),
        city: 'Praia do Rosa',
        state: 'SC',
        address: 'Rua das Baleias, 123',
        plan: Plan.PRO,
        whatsapp: '554899999999',
        email: 'contato@villatest.com',
        registrationNumber: 'TEST/PRO/SC',
        status: 'ACTIVE',
        isTrial: true,
        userId: user.id
      }
    });
  }

  // 2. Simular o "Aprendizado" criando algumas mensagens outbound
  console.log('🧠 Simulando aprendizado de persona...');
  await prisma.message.create({
    data: {
      phone: '5511988888888',
      content: 'Seja muito bem-vindo ao nosso paraíso! Ficaremos encantados em receber vocês.',
      direction: 'OUTBOUND',
      propertyId: property.id,
      type: 'TEXT',
      status: 'SENT'
    }
  });

  // 3. Simular uma mensagem de entrada do hóspede
  console.log('💬 Hóspede pergunta sobre preço...');
  const response = await WhatsappAgentService.processIncomingMessage({
    propertyId: property.id,
    phone: '5511988888888',
    pushName: 'Ricardo',
    messageText: 'Olá, qual o valor da diária para o próximo feriado?'
  });

  console.log('\n--- RESPOSTA DO AGENTE ZEHLA ---');
  console.log('Intent Identificada:', response.intent);
  console.log('Resposta Final:', response.response);
  console.log('--------------------------------\n');

  if (response.success && response.response.includes('encantados')) {
    console.log('✅ SUCESSO: O agente usou a persona aprendida!');
  } else {
    console.log('⚠️ AVISO: A resposta pode não ter usado a persona completamente.');
  }
}

testProAgent().catch(console.error);
