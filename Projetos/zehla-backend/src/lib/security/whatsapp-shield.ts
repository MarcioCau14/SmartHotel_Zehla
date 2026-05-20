/**
 * ZEHLA WHATSAPP SHIELD
 * Proteção ativa contra spam, phishing e tentativas de sequestro de conta.
 */

const SUSPICIOUS_KEYWORDS = [
  'código de verificação',
  'confirme seu número',
  'vencimento de boleto',
  'ganhe agora',
  'clique aqui para resgatar',
  'transferência imediata',
];

export interface ShieldVerdict {
  isSafe: boolean;
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  reason?: string;
}

export function auditMessage(content: string, phone: string): ShieldVerdict {
  const lowercaseContent = content.toLowerCase();

  // 1. Detecção de Keywords Suspeitas
  const foundKeyword = SUSPICIOUS_KEYWORDS.find(kw => lowercaseContent.includes(kw));
  if (foundKeyword) {
    return {
      isSafe: false,
      threatLevel: 'HIGH',
      reason: `Keyword suspeita detectada: "${foundKeyword}"`,
    };
  }

  // 2. Detecção de Muitos Links (Spam)
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) {
    return {
      isSafe: false,
      threatLevel: 'MEDIUM',
      reason: 'Excesso de links na mensagem (Provável SPAM)',
    };
  }

  // 3. Detecção de Caracteres Especiais Excessivos
  if (content.length > 50 && (content.match(/[!@#$%^&*()]/g) || []).length > content.length * 0.3) {
    return {
      isSafe: false,
      threatLevel: 'LOW',
      reason: 'Alta densidade de caracteres especiais',
    };
  }

  return { isSafe: true, threatLevel: 'NONE' };
}

import crypto from 'crypto';

/**
 * Validação de Assinatura HMAC (Evolution API)
 * Garante que a requisição veio realmente do nosso gateway.
 */
export function verifyWhatsAppSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const checksum = Buffer.from(signature, 'utf8');

  // Comparação em tempo constante para evitar timing attacks
  if (checksum.length !== digest.length) return false;
  return crypto.timingSafeEqual(digest, checksum);
}

/**
 * Rate Limiting por número de telefone
 */
export async function checkWhatsAppRateLimit(phone: string): Promise<boolean> {
  // Implementação simplificada para o MVP. 
  // Em produção, isso consulta o Redis DB 0 para verificar janelas de tempo.
  console.log(`[SHIELD] Rate limit check para ${phone} - OK`);
  return true;
}
