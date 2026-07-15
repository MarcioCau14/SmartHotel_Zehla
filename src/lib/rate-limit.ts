// ==============================================================================
// ZEHLA SmartHotel — API Rate Limiter (Serverless-Safe)
// ==============================================================================
// Sem dependência de setInterval — seguro para ambientes serverless (Vercel).
// Usa lazy cleanup no fallback in-memory e Upstash Redis REST quando disponível.
// ==============================================================================

const cache = new Map<string, { count: number; reset: number }>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

function parseWindow(s: string): number {
  const match = s.match(/^(\d+)\s*(ms|s|m|h)$/);
  if (!match) return 60000;
  const n = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000 };
  return n * (multipliers[unit] ?? 60000);
}

/**
 * Lazy cleanup — remove expired entries only when called, avoiding setInterval.
 */
function lazyCleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of cache.entries()) {
    if (now > entry.reset) {
      cache.delete(key);
    }
  }
}

function createLocalRatelimit(requests: number, window: string) {
  const windowMs = parseWindow(window);
  return {
    limit: async (key: string) => {
      lazyCleanup();
      const now = Date.now();
      const entry = cache.get(key);
      if (!entry || now > entry.reset) {
        cache.set(key, { count: 1, reset: now + windowMs });
        return { success: true, limit: requests, remaining: requests - 1, reset: now + windowMs };
      }
      entry.count++;
      if (entry.count > requests) {
        return { success: false, limit: requests, remaining: 0, reset: entry.reset };
      }
      return { success: true, limit: requests, remaining: requests - entry.count, reset: entry.reset };
    },
  };
}

/**
 * Upstash Redis REST rate limiter — uses INCR + PEXPIRE for atomic sliding window.
 */
function createUpstashRatelimit(requests: number, window: string) {
  const windowMs = parseWindow(window);
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

  return {
    limit: async (key: string) => {
      const redisKey = `rl:${key}`;
      try {
        // Pipeline: INCR + PTTL in a single request
        const res = await fetch(`${url}/pipeline`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            ['INCR', redisKey],
            ['PTTL', redisKey],
          ]),
          signal: AbortSignal.timeout(3000),
        });

        if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
        const results = await res.json() as Array<{ result: number }>;
        const count = results[0]?.result ?? 1;
        const ttl = results[1]?.result ?? -1;

        // Set expiry on first request (TTL will be -1 for new keys)
        if (ttl < 0) {
          await fetch(`${url}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(['PEXPIRE', redisKey, windowMs]),
            signal: AbortSignal.timeout(2000),
          });
        }

        const reset = Date.now() + (ttl > 0 ? ttl : windowMs);
        const remaining = Math.max(0, requests - count);
        return {
          success: count <= requests,
          limit: requests,
          remaining,
          reset,
        };
      } catch {
        // Fallback to local on Redis failure
        return createLocalRatelimit(requests, window).limit(key);
      }
    },
  };
}

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

interface RatelimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RatelimitInstance {
  limit: (key: string) => Promise<RatelimitResult>;
}

export const apiRatelimit: RatelimitInstance = hasRedis
  ? createUpstashRatelimit(60, '60 s')
  : createLocalRatelimit(60, '60 s');

export const authRatelimit: RatelimitInstance = hasRedis
  ? createUpstashRatelimit(5, '60 s')
  : createLocalRatelimit(5, '60 s');
