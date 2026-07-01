const cache = new Map<string, { count: number; reset: number }>();

function parseWindow(s: string): number {
  const match = s.match(/^(\d+)\s*(ms|s|m|h)$/);
  if (!match) return 60000;
  const n = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000 };
  return n * (multipliers[unit] ?? 60000);
}

function createLocalRatelimit(requests: number, window: string) {
  const windowMs = parseWindow(window);
  return {
    limit: async (key: string) => {
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

const globalCtx = globalThis as Record<string, unknown>;
if (!globalCtx.__rateLimitCleanup) {
  globalCtx.__rateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now > (entry as { reset: number }).reset) {
        cache.delete(key);
      }
    }
  }, 60_000);
  if (typeof (globalCtx.__rateLimitCleanup as NodeJS.Timeout).unref === 'function') {
    (globalCtx.__rateLimitCleanup as NodeJS.Timeout).unref();
  }
}

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

interface RatelimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RatelimitInstance {
  limit: (key: string) => Promise<RatelimitResult>;
}

export const apiRatelimit: RatelimitInstance = hasRedis
  ? { limit: async () => ({ success: true, limit: 60, remaining: 59, reset: Date.now() + 60000 }) }
  : createLocalRatelimit(60, '60 s');

export const authRatelimit: RatelimitInstance = hasRedis
  ? { limit: async () => ({ success: true, limit: 5, remaining: 4, reset: Date.now() + 60000 }) }
  : createLocalRatelimit(5, '60 s');
