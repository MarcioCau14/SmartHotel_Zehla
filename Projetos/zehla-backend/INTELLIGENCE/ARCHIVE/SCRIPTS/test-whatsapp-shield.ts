import { checkWhatsAppRateLimit } from '../src/lib/security/whatsapp-shield';

async function testRateLimit() {
  const phone = '5511999999999';
  console.log(`🛡️  [WHATSAPP SHIELD] Testando Rate Limiting para o número: ${phone}`);

  for (let i = 1; i <= 12; i++) {
    const isAllowed = await checkWhatsAppRateLimit(phone);
    console.log(`Mensagem ${i}: ${isAllowed ? '✅ Permitida' : '🚨 BLOQUEADA'}`);
    
    if (i === 10 && isAllowed) {
      console.log('--- Limite de 10 atingido ---');
    }
  }

  const finalCheck = await checkWhatsAppRateLimit(phone);
  if (!finalCheck) {
    console.log('\n✅ SUCESSO: O sistema bloqueou o excesso de mensagens corretamente.');
  } else {
    console.log('\n❌ FALHA: O rate limit não funcionou como esperado.');
  }
  
  process.exit(0);
}

testRateLimit().catch(console.error);
