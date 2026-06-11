import { redisSession } from '../redis'

const BACKOFF_KEY_PREFIX = 'rl_msg_backoff:'
const LAST_SENT_KEY_PREFIX = 'rl_msg_last:'
const MIN_INTERVAL_MS = 3000
const MAX_BACKOFF_MS = 60000
const INITIAL_BACKOFF_MS = 5000

export interface MessagingRateLimitResult {
  allowed: boolean
  retryAfterMs: number
}

export async function checkMessagingRateLimit(phone: string): Promise<MessagingRateLimitResult> {
  if (!redisSession || typeof redisSession.get !== 'function') {
    return { allowed: true, retryAfterMs: 0 }
  }

  const backoffKey = `${BACKOFF_KEY_PREFIX}${phone}`
  const lastSentKey = `${LAST_SENT_KEY_PREFIX}${phone}`

  const backoffRemaining = await redisSession.get(backoffKey)
  if (backoffRemaining) {
    const remaining = parseInt(backoffRemaining, 10)
    if (remaining > 0 && remaining <= MAX_BACKOFF_MS) {
      return { allowed: false, retryAfterMs: remaining }
    }
  }

  const lastSent = await redisSession.get(lastSentKey)
  if (lastSent) {
    const elapsed = Date.now() - parseInt(lastSent, 10)
    if (elapsed < MIN_INTERVAL_MS) {
      return { allowed: false, retryAfterMs: MIN_INTERVAL_MS - elapsed }
    }
  }

  await redisSession.set(lastSentKey, String(Date.now()))
  await redisSession.expire(lastSentKey, 10)

  return { allowed: true, retryAfterMs: 0 }
}

export async function registerBackoff(phone: string, currentBackoffMs?: number): Promise<void> {
  if (!redisSession || typeof redisSession.set !== 'function') return

  const nextBackoff = Math.min(
    (currentBackoffMs || INITIAL_BACKOFF_MS) * 2,
    MAX_BACKOFF_MS
  )
  const backoffKey = `${BACKOFF_KEY_PREFIX}${phone}`
  await redisSession.setex(backoffKey, Math.ceil(nextBackoff / 1000), String(nextBackoff))
}

export async function resetBackoff(phone: string): Promise<void> {
  if (!redisSession || typeof redisSession.del !== 'function') return
  const backoffKey = `${BACKOFF_KEY_PREFIX}${phone}`
  await redisSession.del(backoffKey)
}
