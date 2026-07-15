import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Padrão GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Retorna o secret garantindo que tenha 32 bytes.
 */
function getEncryptionSecret(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    // Em MODO MOCK, se não houver secret, usa um fallback estático apenas para o ambiente de dev
    // Em produção, isso DEVE estar configurado
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_SECRET is not set in environment variables.');
    }
    return crypto.scryptSync('mock-secret-for-dev-only', 'salt', 32);
  }

  // Se o secret for hex (64 chars)
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, 'hex');
  }

  // Se for uma string de texto, faz hash para 32 bytes para garantir o tamanho
  return crypto.scryptSync(secret, 'salt', 32);
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
