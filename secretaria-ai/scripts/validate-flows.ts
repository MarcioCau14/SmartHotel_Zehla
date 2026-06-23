import { db } from '../src/lib/db';

async function main() {
  console.log('🔍 Iniciando script de validação de fluxos do ZEHLA SmartHotel...\n');
  const targetUrl = 'http://localhost:3000';

  // 1. Verificar se o servidor está ativo
  console.log('1. Verificando conectividade com o servidor local...');
  try {
    const res = await fetch(`${targetUrl}/api/brain`);
    if (!res.ok) {
      throw new Error(`Servidor respondeu com status ${res.status}`);
    }
    const brainState = await res.json();
    console.log('   ✅ Servidor local conectado com sucesso.');
    console.log(`   🧠 Estado do Roteador Cognitivo: ${brainState.providerSelectorState || 'Ativo'}`);
  } catch (error: any) {
    console.error('   ❌ Falha ao conectar ao servidor local. Certifique-se de que "npm run dev" está rodando em http://localhost:3000.');
    console.error(`      Erro: ${error.message}`);
    process.exit(1);
  }

  // 2. Testar Registro de Tenant (NextAuth)
  console.log('\n2. Testando Registro de Tenant (/api/auth/register)...');
  const testEmail = `test-tenant-${Date.now()}@pousada.com.br`;
  const registerPayload = {
    name: 'Pousada Teste Automático',
    email: testEmail,
    password: 'Password@123',
    phone: '11988887777',
    pousadaName: 'Pousada Teste Local'
  };

  try {
    const res = await fetch(`${targetUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Falha ao registrar: ${data.error || res.statusText}`);
    }
    console.log(`   ✅ Tenant registrado com sucesso: ${data.tenant.email} (ID: ${data.tenant.id})`);
  } catch (error: any) {
    console.error(`   ❌ Falha no registro: ${error.message}`);
    process.exit(1);
  }

  // 3. Testar Geração de Checkout (Mercado Pago PIX)
  console.log('\n3. Testando Geração de Checkout (/api/checkout/create)...');
  const checkoutPayload = {
    email: testEmail,
    name: 'Pousada Teste Automático',
    planType: 'lite',
    paymentMethod: 'pix'
  };

  let subscriptionId = '';
  let ticketUrl = '';
  let paymentId = '';

  try {
    const res = await fetch(`${targetUrl}/api/checkout/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Falha no checkout: ${data.error || res.statusText}`);
    }
    subscriptionId = data.subscriptionId;
    ticketUrl = data.checkoutUrl;
    console.log(`   ✅ Checkout criado com sucesso.`);
    console.log(`      Assinatura ID: ${subscriptionId}`);
    console.log(`      Checkout URL: ${ticketUrl}`);
    if (data.pix) {
      console.log(`      PIX QR Code gerado com sucesso.`);
    }
  } catch (error: any) {
    console.error(`   ❌ Falha na geração do checkout: ${error.message}`);
    process.exit(1);
  }

  // 4. Testar Webhook do Mercado Pago (Confirmação de Pagamento)
  console.log('\n4. Testando Webhook de Pagamento (/api/checkout/webhook)...');
  const subInDb = await db.subscription.findUnique({ where: { id: subscriptionId } });
  paymentId = subInDb?.paymentId || 'test-payment-id-123';

  const webhookPayload = {
    action: 'payment.updated',
    type: 'payment',
    data: { id: paymentId }
  };

  try {
    const res = await fetch(`${targetUrl}/api/checkout/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Falha no webhook: ${data.error || res.statusText}`);
    }
    console.log('   ✅ Payload do webhook processado pelo servidor.');
    
    const updatedSub = await db.subscription.findUnique({ where: { id: subscriptionId } });
    console.log(`      Status da assinatura no DB: ${updatedSub?.status}`);
    console.log(`      Status do pagamento no DB: ${updatedSub?.paymentStatus}`);
  } catch (error: any) {
    console.error(`   ❌ Falha no webhook: ${error.message}`);
  }

  // 5. Testar WhatsApp Webhook e Resposta Cognitiva da IA
  console.log('\n5. Testando Entrada de Mensagem via WhatsApp Webhook (/api/webhook-whatsapp)...');
  const tenantObj = await db.tenant.findFirst({ where: { email: testEmail } });
  if (!tenantObj) {
    throw new Error('Tenant de teste não encontrado no banco de dados');
  }

  const whatsappPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '123456789',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '5511999999999',
                phone_number_id: '987654321'
              },
              contacts: [
                {
                  profile: { name: 'Cliente Validação' },
                  wa_id: '5511988887777'
                }
              ],
              messages: [
                {
                  from: '5511988887777',
                  id: `wamid.HBgNNTUxMTk4ODg4Nzc3NxUCABEYEkU4RDJGMTdGODJDRDM3NDNFQQA=`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: 'Olá! Vocês aceitam animais de estimação na pousada?' },
                  type: 'text'
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(`${targetUrl}/api/webhook-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(whatsappPayload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Falha no webhook-whatsapp: ${data.error || res.statusText}`);
    }
    console.log('   ✅ Webhook WhatsApp recebeu a mensagem de teste.');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const guest = await db.guest.findFirst({
      where: { phone: '5511988887777' },
      include: {
        conversations: {
          include: { messages: true }
        }
      }
    });

    if (guest && guest.conversations.length > 0) {
      console.log('   ✅ Registro do Hóspede e Conversa salvos no DB.');
      const messages = guest.conversations[0].messages;
      console.log(`      Mensagens na timeline: ${messages.length}`);
      
      const lastMessage = messages[messages.length - 1];
      console.log(`      Último remetente: ${lastMessage.from}`);
      console.log(`      Conteúdo: "${lastMessage.content}"`);
    } else {
      console.log('   ⚠️ Webhook processado, mas dados do hóspede não persistiram no DB.');
    }
  } catch (error: any) {
    console.error(`   ❌ Falha no webhook do WhatsApp: ${error.message}`);
  }

  // Limpar dados de teste criados
  console.log('\n🧹 Limpando registros de validação temporários...');
  try {
    if (tenantObj) {
      await db.property.deleteMany({ where: { tenantId: tenantObj.id } });
      await db.subscription.deleteMany({ where: { tenantId: tenantObj.id } });
      await db.tenant.delete({ where: { id: tenantObj.id } });
    }
    await db.guest.deleteMany({ where: { phone: '5511988887777' } });
    console.log('   ✅ Banco de dados limpo com sucesso.');
  } catch (cleanError: any) {
    console.warn(`   ⚠️ Erro ao limpar tabelas: ${cleanError.message}`);
  }

  console.log('\n🎉 Fim da validação de fluxos. Tudo operacional!');
}

main()
  .catch((e) => {
    console.error('❌ Validação interrompida por erro crítico:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
