// ==============================================================================
// ZEHLA SmartHotel — Distributed Rate Limiter para Zellador (Upstash Redis)
// ==============================================================================
// Limita requisições por tenantId usando Upstash Redis com fallback in-memory.
// Sem dependência de setInterval — seguro para ambientes serverless (Vercel).
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

// Upstash Redis Config
const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? '';
const isRedisEnabled = !!(redisUrl && redisToken);

// Circuit Breaker State
let redisFailuresCount = 0;
let redisLastFailureTime = 0;
const REDIS_BYPASS_COOLDOWN_MS = 60_000; // 1 minuto de bypass se falhar

// Mapa em memória para fallback local
const localRateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remainingMinute: number;
  remainingDay: number;
  retryAfterSeconds?: number;
}

/**
 * Lazy cleanup do mapa em memória para evitar memory leaks sem usar setInterval.
 */
function runLazyCleanup() {
  const now = Date.now();
  for (const [key, entry] of localRateLimitStore.entries()) {
    if (now > entry.dailyResetAt + DAY_WINDOW_MS) {
      localRateLimitStore.delete(key);
    }
  }
}

/**
 * Lógica do Rate Limiting aplicada sobre uma entrada (tanto in-memory quanto Redis).
 */
function processRateLimitLogic(entry: RateLimitEntry | null, now: number): {
  updatedEntry: RateLimitEntry;
  result: RateLimitResult;
} {
  if (!entry) {
    const newEntry = {
      timestamps: [now],
      dailyCount: 1,
      dailyResetAt: now,
    };
    return {
      updatedEntry: newEntry,
      result: {
        allowed: true,
        remainingMinute: MAX_REQUESTS_PER_MINUTE - 1,
        remainingDay: MAX_REQUESTS_PER_DAY - 1,
      }
    };
  }

  // Reset diário
  if (now > entry.dailyResetAt + DAY_WINDOW_MS) {
    entry.dailyCount = 0;
    entry.dailyResetAt = now;
    entry.timestamps = [];
  }

  // Limpar timestamps antigos (janela de 1 minuto)
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < MINUTE_WINDOW_MS);

  // Verificar limite por minuto
  if (entry.timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestInWindow = Math.min(...entry.timestamps);
    const retryAfter = Math.ceil((oldestInWindow + MINUTE_WINDOW_MS - now) / 1_000);
    return {
      updatedEntry: entry,
      result: {
        allowed: false,
        remainingMinute: 0,
        remainingDay: MAX_REQUESTS_PER_DAY - entry.dailyCount,
        retryAfterSeconds: Math.max(1, retryAfter),
      }
    };
  }

  // Verificar limite diário
  if (entry.dailyCount >= MAX_REQUESTS_PER_DAY) {
    const timeUntilReset = Math.ceil((entry.dailyResetAt + DAY_WINDOW_MS - now) / 1_000);
    return {
      updatedEntry: entry,
      result: {
        allowed: false,
        remainingMinute: MAX_REQUESTS_PER_MINUTE - entry.timestamps.length,
        remainingDay: 0,
        retryAfterSeconds: Math.max(1, timeUntilReset),
      }
    };
  }

  // Registrar requisição
  entry.timestamps.push(now);
  entry.dailyCount += 1;

  return {
    updatedEntry: entry,
    result: {
      allowed: true,
      remainingMinute: MAX_REQUESTS_PER_MINUTE - entry.timestamps.length,
      remainingDay: MAX_REQUESTS_PER_DAY - entry.dailyCount,
    }
  };
}

/**
 * Fallback in-memory quando o Redis está indisponível ou desabilitado.
 */
function checkLocalRateLimit(tenantId: string, now: number): RateLimitResult {
  runLazyCleanup();
  const entry = localRateLimitStore.get(tenantId) || null;
  const { updatedEntry, result } = processRateLimitLogic(entry, now);
  localRateLimitStore.set(tenantId, updatedEntry);
  return result;
}

/**
 * Verifica se o tenant está autorizado a fazer requisições (Distributed + Fallback local).
 */
export async function checkZelladorRateLimit(tenantId: string): Promise<RateLimitResult> {
  const now = Date.now();

  // Se o Redis não está habilitado ou está em cooldown após falhas consecutivas
  const isRedisBypassed = now - redisLastFailureTime < REDIS_BYPASS_COOLDOWN_MS;
  if (!isRedisEnabled || isRedisBypassed) {
    return checkLocalRateLimit(tenantId, now);
  }

  const key = `ratelimit:zellador:${tenantId}`;

  try {
    // 1. Obter entrada do Redis (Upstash REST API)
    const response = await fetch(`${redisUrl}/get/${key}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
      signal: AbortSignal.timeout(1500), // Timeout rígido para evitar lentidão
    });

    if (!response.ok) throw new Error('Redis request failed');

    const data = await response.json() as { result: string | null };
    let entry: RateLimitEntry | null = null;
    if (data.result) {
      entry = JSON.parse(data.result) as RateLimitEntry;
    }

    // 2. Processar a lógica
    const { updatedEntry, result } = processRateLimitLogic(entry, now);

    // 3. Salvar de volta no Redis com TTL de 24 horas (86400 segundos)
    await fetch(`${redisUrl}/set/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${redisToken}`,
      },
      body: JSON.stringify(JSON.stringify(updatedEntry)),
      signal: AbortSignal.timeout(1500),
    });

    await fetch(`${redisUrl}/expire/${key}/86400`, {
      headers: { Authorization: `Bearer ${redisToken}` },
      signal: AbortSignal.timeout(1000),
    });

    // Reset falhas se deu tudo certo
    redisFailuresCount = 0;

    return result;
  } catch (error) {
    redisFailuresCount++;
    if (redisFailuresCount >= 3) {
      redisLastFailureTime = now;
      console.warn(`[checkZelladorRateLimit] Upstash Redis falhou 3 vezes consecutivas. Bypassing por ${REDIS_BYPASS_COOLDOWN_MS / 1000}s.`);
    }
    console.error('[checkZelladorRateLimit] Redis error, falling back to local memory:', error);
    return checkLocalRateLimit(tenantId, now);
  }
}
