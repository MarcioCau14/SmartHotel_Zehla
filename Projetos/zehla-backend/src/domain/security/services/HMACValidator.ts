import { Result } from '../../../shared/Result'

export class HMACValidator {
  static async validate(
    payload: string,
    signature: string,
    secret: string,
    algorithm: string = 'sha256',
  ): Promise<Result<void, Error>> {
    if (!signature || !secret) {
      return Result.fail(new Error('HMAC signature or secret is empty'))
    }

    const encoder = new TextEncoder()
    const keyBytes = encoder.encode(secret)
    const payloadBytes = encoder.encode(payload)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: algorithm === 'sha256' ? 'SHA-256' : 'SHA-1' } },
      false,
      ['sign'],
    )

    const expectedBytes = await crypto.subtle.sign('HMAC', cryptoKey, payloadBytes)
    const expectedHex = Array.from(new Uint8Array(expectedBytes))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    if (!timingSafeEqual(expectedHex, signature)) {
      return Result.fail(new Error('Invalid HMAC signature'))
    }

    return Result.ok(undefined)
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let result = a.length ^ b.length
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
    }
    return result === 0
  }
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export class IdempotencyBarrier {
  private readonly store: Map<string, number>
  private readonly ttlMs: number

  constructor(ttlMs: number = 60_000) {
    this.store = new Map()
    this.ttlMs = ttlMs
    setInterval(() => this._evict(), ttlMs)
  }

  check(key: string): boolean {
    const now = Date.now()
    const entry = this.store.get(key)
    if (entry && now < entry) {
      return false
    }
    this.store.set(key, now + this.ttlMs)
    return true
  }

  private _evict(): void {
    const now = Date.now()
    for (const [key, expiry] of this.store.entries()) {
      if (now >= expiry) this.store.delete(key)
    }
  }

  get size(): number {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }
}
