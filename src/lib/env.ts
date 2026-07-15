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
export const NEXTAUTH_SECRET = (() => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is required in production — set a cryptographically random value (≥32 chars)');
  }
  return secret || 'dev-secret-change-in-production';
})();

// Mercado Pago
export const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? '';
export const MP_WEBHOOK_URL = process.env.MP_WEBHOOK_URL ?? '';

// AI Providers
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
export const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? '';
export const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY ?? '';
export const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY ?? '';
export const GLM_5_2_API_KEY = process.env.GLM_5_2_API_KEY ?? '';
export const KIMI_K2_6_API_KEY = process.env.KIMI_K2_6_API_KEY ?? '';
export const OLLAMA_URL = process.env.OLLAMA_URL ?? '';
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? '';

// Security
export const CACHE_SIGNING_SECRET = process.env.CACHE_SIGNING_SECRET ?? '';
export const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET ?? '';

// Logging
export const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';

// Upstash Redis (para semantic cache distribuído)
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL ?? '';
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? '';

// ZAOS Router
export const ZAI_API_KEY = process.env.ZAI_API_KEY ?? '';
export const ZEHLA_LOOP_API_KEY = process.env.ZEHLA_LOOP_API_KEY ?? '';

// Meta Cost Guard
export const META_COST_GUARD_ENABLED = process.env.META_COST_GUARD_ENABLED ?? 'false';
export const META_COST_LIMIT_PER_MESSAGE = Number(process.env.META_COST_LIMIT_PER_MESSAGE ?? '0.10');
