import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Padrão GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Retorna o secret garantindo que tenha 32 bytes.
 */
// Dev-mode fallback secret — generated once per process, NOT a predictable hardcoded string
let _devEncryptionSecret: string | null = null;

/**
 * Derives a proper salt from the encryption secret using HMAC,
 * instead of the insecure hardcoded literal string 'salt'.
 * The salt is deterministic (same secret → same key) so decryption works,
 * but is NOT publicly known — requires the secret to compute.
 */
function deriveSalt(secret: string): Buffer {
  return crypto.createHmac('sha256', secret).update('zella-encryption-salt-derivation-v2').digest().slice(0, 16);
}

function getEncryptionSecret(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    // During Vercel build phase, use a throwaway random value (not used at runtime)
    if (process.env.NEXT_PHASE?.includes('build')) {
      return crypto.scryptSync(crypto.randomUUID(), deriveSalt(crypto.randomUUID()), 32);
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_SECRET is not set in environment variables.');
    }
    // Dev mode: auto-generate a random secret per process (NOT a predictable hardcoded string)
    if (!_devEncryptionSecret) {
      _devEncryptionSecret = crypto.randomUUID() + crypto.randomUUID();
      console.warn('[ENCRYPTION] ENCRYPTION_SECRET not set — generated random key for dev mode. Encrypted data will NOT persist across server restarts. Set ENCRYPTION_SECRET env var for persistence.');
    }
    return crypto.scryptSync(_devEncryptionSecret, deriveSalt(_devEncryptionSecret), 32);
  }

  // Se o secret for hex (64 chars)
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, 'hex');
  }

  // Se for uma string de texto, faz hash para 32 bytes usando HMAC-derived salt
  return crypto.scryptSync(secret, deriveSalt(secret), 32);
}

/**
 * Criptografa um texto em AES-256-GCM e retorna string em base64.
 * Formato retornado: iv:authTag:encryptedText
 */
export function encryptText(text: string): string {
  if (!text) return text;
  
  const secret = getEncryptionSecret();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, secret, iv);

  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');

  return `${iv.toString('base64')}:${authTag}:${encrypted}`;
}

/**
 * Descriptografa um texto do formato iv:authTag:encryptedText.
 */
export function decryptText(encryptedData: string): string {
  if (!encryptedData) return encryptedData;

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    // Pode não estar criptografado ainda (legado) ou estar vazio
    return encryptedData;
  }

  try {
    const [ivBase64, authTagBase64, encryptedTextBase64] = parts;
    const secret = getEncryptionSecret();
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, secret, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedTextBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    // Em caso de falha de descriptografia, retornamos fallback ou lançamos erro.
    return '';
  }
}

/**
 * Mascara a chave para exibição no frontend (ex: sk-...a1b2).
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '***';
  
  // Se for chave OpenAI (sk-xxx)
  if (apiKey.startsWith('sk-')) {
    const prefix = apiKey.substring(0, 5);
    const suffix = apiKey.substring(apiKey.length - 4);
    return `${prefix}...${suffix}`;
  }
  
  // Outros provedores
  const prefix = apiKey.substring(0, 4);
  const suffix = apiKey.substring(apiKey.length - 4);
  return `${prefix}...${suffix}`;
}
