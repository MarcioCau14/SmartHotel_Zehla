// ==============================================================================
// ZEHLA SmartHotel — In-Memory Rate Limiter para Zellador
// ==============================================================================
// Limita requisições por tenantId usando mapa em memória com expiração.
// Sem Redis — adequado para single-instance (Bun / Vercel).
// ==============================================================================

interface RateLimitEntry {
  timestamps: number[];
  dailyCount: number;
  dailyResetAt: number;
}

const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_REQUESTS_PER_DAY = 100;
const MINUTE_WINDOW_MS = 60_000;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1_000;

// Mapa em memória: tenantId → RateLimitEntry
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup a cada 5 minutos para evitar memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entradas onde o dia já expirou
    if (now > entry.dailyResetAt + DAY_WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60_000);

export interface RateLimitResult {
  allowed: boolean;
  remainingMinute: number;
  remainingDay: number;
  retryAfterSeconds?: number;
}

/**
 * Verifica se o tenant pode fazer uma requisição ao Zellador.
 * Retorna { allowed: false } se excedeu o limite, com header Retry-After.
 */
export function checkZelladorRateLimit(tenantId: string): RateLimitResult {
  const now = Date.now();

  let entry = rateLimitStore.get(tenantId);

  if (!entry) {
    // Primeira requisição deste tenant
    entry = {
      timestamps: [now],
      dailyCount: 1,
      dailyResetAt: now,
    };
    rateLimitStore.set(tenantId, entry);
    return {
      allowed: true,
      remainingMinute: MAX_REQUESTS_PER_MINUTE - 1,
      remainingDay: MAX_REQUESTS_PER_DAY - 1,
    };
  }

  // Reset diário
  if (now > entry.dailyResetAt + DAY_WINDOW_MS) {
    entry.dailyCount = 0;
    entry.dailyResetAt = now;
    entry.timestamps = [];
  }

  // Limpar timestamps antigos (janela de 1 minuto)
  entry.timestamps = entry.timestamps.filter(
    (ts) => now - ts < MINUTE_WINDOW_MS,
  );

  // Verificar limite por minuto
  if (entry.timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestInWindow = Math.min(...entry.timestamps);
    const retryAfter = Math.ceil((oldestInWindow + MINUTE_WINDOW_MS - now) / 1_000);
    return {
      allowed: false,
      remainingMinute: 0,
      remainingDay: MAX_REQUESTS_PER_DAY - entry.dailyCount,
      retryAfterSeconds: Math.max(1, retryAfter),
    };
  }

  // Verificar limite diário
  if (entry.dailyCount >= MAX_REQUESTS_PER_DAY) {
    const timeUntilReset = Math.ceil((entry.dailyResetAt + DAY_WINDOW_MS - now) / 1_000);
    return {
      allowed: false,
      remainingMinute: MAX_REQUESTS_PER_MINUTE - entry.timestamps.length,
      remainingDay: 0,
      retryAfterSeconds: Math.max(1, timeUntilReset),
    };
  }

  // Registrar requisição
  entry.timestamps.push(now);
  entry.dailyCount += 1;

  return {
    allowed: true,
    remainingMinute: MAX_REQUESTS_PER_MINUTE - entry.timestamps.length,
    remainingDay: MAX_REQUESTS_PER_DAY - entry.dailyCount,
  };
}
