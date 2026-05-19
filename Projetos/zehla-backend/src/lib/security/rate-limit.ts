import { redis } from '@/lib/redis';


export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Generic Rate Limiter using Redis INCR and EXPIRE.
 * @param key The key to limit (e.g., ip, user:id)
 * @param limit Max requests allowed
 * @param windowSeconds Time window in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const fullKey = `ratelimit:${key}`;
  const current = await redis.incr(fullKey);
  
  if (current === 1) {
    await redis.expire(fullKey, windowSeconds);
  }
  
  const ttl = await redis.ttl(fullKey);
  const remaining = Math.max(0, limit - current);
  
  return {
    success: current <= limit,
    limit,
    remaining,
    reset: Math.floor(Date.now() / 1000) + ttl
  };
}
