// Centralized env access with validation
function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

// Database
export const DATABASE_URL = getEnv('DATABASE_URL', 'file:./db/custom.db');

// NextAuth
export const NEXTAUTH_URL = getEnv('NEXTAUTH_URL', 'http://localhost:3000');
export const NEXTAUTH_SECRET = getEnv('NEXTAUTH_SECRET', 'dev-secret-change-in-production');

// Mercado Pago
export const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? '';
export const MP_WEBHOOK_URL = process.env.MP_WEBHOOK_URL ?? '';

// AI Providers (Novos)
export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? '';
export const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY ?? '';
export const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY ?? '';

// Upstash Redis (para semantic cache distribuído)
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL ?? '';
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? '';
