import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, limiters } from './rate-limit'

export async function webhookRateGuard(
  request: NextRequest
): Promise<NextResponse | null> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  const result = await checkRateLimit(limiters.webhook, `wh:${ip}`)
  if (!result.success) {
    return NextResponse.json({
      error: 'Too many requests',
      code: 'RATE_LIMITED',
      retryAfter: result.reset - Math.floor(Date.now() / 1000),
    }, {
      status: 429,
      headers: { 'Retry-After': String(result.reset - Math.floor(Date.now() / 1000)) },
    })
  }
  return null
}
