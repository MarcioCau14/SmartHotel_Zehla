import { redis } from '@/lib/redis'
import { RateLimiterRedis } from 'rate-limiter-flexible'

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

function createLimiter(keyPrefix: string, points: number, duration: number): RateLimiterRedis | null {
  try {
    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix,
      points,
      duration,
      blockDuration: duration,
    })
  } catch {
    return null
  }
}

export const limiters: Record<string, RateLimiterRedis | null> = {
  api: createLimiter('rl_api', 50, 60),
  campaign: createLimiter('rl_campaign', 1, 600),
  webhook: createLimiter('rl_webhook', 100, 60),
  auth: createLimiter('rl_auth', 10, 60),
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const limiter = createLimiter(`rl_custom:${key}`, limit, windowSeconds)
  if (!limiter) return { success: true, limit, remaining: 1, reset: 0 }
  try {
    const result = await limiter.consume(key, 1)
    return {
      success: true,
      limit,
      remaining: result.remainingPoints,
      reset: Math.floor(Date.now() / 1000) + windowSeconds,
    }
  } catch (err: any) {
    if (err?.msBeforeNext !== undefined) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Math.floor(Date.now() / 1000) + Math.ceil(err.msBeforeNext / 1000),
      }
    }
    return { success: true, limit, remaining: 1, reset: 0 }
  }
}

export async function checkRateLimit(
  limiter: RateLimiterRedis | null,
  key: string
): Promise<RateLimitResult> {
  if (!limiter) return { success: true, limit: 1, remaining: 1, reset: 0 }
  try {
    const result = await limiter.consume(key, 1)
    return {
      success: true,
      limit: result.remainingPoints + 1,
      remaining: result.remainingPoints,
      reset: Math.floor(Date.now() / 1000) + Math.ceil(result.msBeforeNext / 1000),
    }
  } catch (err: any) {
    if (err?.msBeforeNext !== undefined) {
      return {
        success: false,
        limit: err.remainingPoints ?? 0,
        remaining: 0,
        reset: Math.floor(Date.now() / 1000) + Math.ceil(err.msBeforeNext / 1000),
      }
    }
    return { success: true, limit: 1, remaining: 1, reset: 0 }
  }
}
