import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

const SECRET = (() => {
  const secret = process.env.CACHE_SIGNING_SECRET;
  if (!secret) {
    // During Vercel build phase, use a throwaway random value (not used at runtime)
    if (process.env.NEXT_PHASE?.includes('build')) {
      return randomBytes(32).toString('hex');
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CACHE_SIGNING_SECRET is required in production');
    }
    // Dev mode: auto-generate a random signing key per process session
    // NOT a predictable hardcoded string
    const generated = randomBytes(32).toString('hex');
    console.warn('[CACHE-SIGNER] CACHE_SIGNING_SECRET not set — generated random key for dev mode. Signed cache data will NOT persist across server restarts. Set CACHE_SIGNING_SECRET env var for persistence.');
    return generated;
  }
  return secret;
})();

interface SignedPayload<T> {
  v: number;
  data: T;
  ts: number;
  exp: number;
  sig: string;
}

export function signCache<T>(data: T, ttlSeconds: number): string {
  const payload: Omit<SignedPayload<T>, 'sig'> = {
    v: 2, data, ts: Date.now(), exp: Date.now() + (ttlSeconds * 1000),
  };
  const sig = createHmac('sha256', SECRET).update(JSON.stringify(payload)).digest('hex');
  return JSON.stringify({ ...payload, sig });
}

export function verifyCache<T>(cached: string): { valid: boolean; data?: T; reason?: string } {
  try {
    const parsed = JSON.parse(cached) as SignedPayload<T>;
    if (parsed.v !== 2) return { valid: false, reason: 'version_mismatch' };
    if (Date.now() > parsed.exp) return { valid: false, reason: 'expired' };
    const payload = { v: parsed.v, data: parsed.data, ts: parsed.ts, exp: parsed.exp };
    const expectedSig = createHmac('sha256', SECRET).update(JSON.stringify(payload)).digest('hex');
    const actualSig = Buffer.from(parsed.sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (actualSig.length !== expectedBuf.length) return { valid: false, reason: 'signature_length' };
    if (!timingSafeEqual(actualSig, expectedBuf)) return { valid: false, reason: 'signature_invalid' };
    return { valid: true, data: parsed.data };
  } catch {
    return { valid: false, reason: 'parse_error' };
  }
}
