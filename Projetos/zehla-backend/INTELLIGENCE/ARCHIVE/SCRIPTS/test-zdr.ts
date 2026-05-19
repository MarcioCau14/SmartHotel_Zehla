import { scanPII } from '../src/lib/security/pii-scanner';


const testText = `
Olá, meu nome é Marcío Cau e meu CPF é 123.456.789-00.
Meu e-mail de contato é marcio@zehla.com.br e meu telefone é (48) 99123-4567.
Ah, e os dados do meu cartão são 1234 5678 1234 5678.
`;

 ---');
const result = scanPII(testText);






if (result.sanitized.includes('CPF_REDACTED') && result.sanitized.includes('EMAIL_REDACTED')) {
  
} else {
  
}
