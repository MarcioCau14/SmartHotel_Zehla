import { createHmac, timingSafeEqual } from 'crypto';


// Segredo para assinatura (garantir fallback seguro)
const SECRET = process.env.CACHE_SIGNING_SECRET || 'zehla-fortress-super-cache-signature-secret-key';

interface SignedPayload<T> {
  v: number;           // Versão do schema
  data: T;             // Dados
  ts: number;          // Timestamp
  exp: number;         // Expiração
  sig: string;         // HMAC-SHA256
}

export function signCache<T>(data: T, ttlSeconds: number): string {
  const payload: Omit<SignedPayload<T>, 'sig'> = {
    v: 2,
    data,
    ts: Date.now(),
    exp: Date.now() + (ttlSeconds * 1000),
  };
    
  const sig = createHmac('sha256', SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return JSON.stringify({ ...payload, sig });
}

export function verifyCache<T>(cached: string): { valid: boolean; data?: T; reason?: string } {
  try {
    const parsed = JSON.parse(cached) as SignedPayload<T>;
      
    // Verifica versão
    if (parsed.v !== 2) return { valid: false, reason: 'version_mismatch' };
      
    // Verifica expiração
    if (Date.now() > parsed.exp) return { valid: false, reason: 'expired' };
      
    // Recalcula assinatura
    const payload = { v: parsed.v, data: parsed.data, ts: parsed.ts, exp: parsed.exp };
    const expectedSig = createHmac('sha256', SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');
      
    const actualSig = Buffer.from(parsed.sig);
    const expectedBuf = Buffer.from(expectedSig);
      
    if (actualSig.length !== expectedBuf.length) {
      return { valid: false, reason: 'signature_length' };
    }
      
    if (!timingSafeEqual(actualSig, expectedBuf)) {
      return { valid: false, reason: 'signature_invalid' };
    }
      
    return { valid: true, data: parsed.data };
      
  } catch (e) {
    return { valid: false, reason: 'parse_error' };
  }
}
