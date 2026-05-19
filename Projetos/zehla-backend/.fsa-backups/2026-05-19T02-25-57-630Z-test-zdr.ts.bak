import { scanPII } from '../src/lib/security/pii-scanner';

const testText = `
Olá, meu nome é Marcío Cau e meu CPF é 123.456.789-00.
Meu e-mail de contato é marcio@zehla.com.br e meu telefone é (48) 99123-4567.
Ah, e os dados do meu cartão são 1234 5678 1234 5678.
`;

console.log('--- TESTE ZDR 2.0 (PII SCANNER) ---');
const result = scanPII(testText);

console.log('Texto Original:', testText);
console.log('-----------------------------------');
console.log('Texto Sanitizado:', result.sanitized);
console.log('Has PII:', result.hasPII);

if (result.sanitized.includes('CPF_REDACTED') && result.sanitized.includes('EMAIL_REDACTED')) {
  console.log('\n✅ SUCESSO: PII detectada e anonimizada corretamente.');
} else {
  console.log('\n❌ FALHA: Alguns dados sensíveis passaram pelo filtro.');
}
