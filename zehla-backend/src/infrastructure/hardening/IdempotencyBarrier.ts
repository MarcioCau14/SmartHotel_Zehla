import type { IIdempotencyBarrier } from '../../application/hardening/ports/IIdempotencyBarrier'

interface IdempotencyEntry {
  timestamp: number
}

export class IdempotencyBarrier implements IIdempotencyBarrier {
  private readonly processed: Map<string, IdempotencyEntry> = new Map()
  private readonly ttlMs: number

  constructor(ttlMs: number = 3600000) {
    this.ttlMs = ttlMs
  }

  checkAndMark(id: string): boolean {
    this.evictExpired()
    if (this.processed.has(id)) {
      return true
    }
    this.processed.set(id, { timestamp: Date.now() })
    return false
  }

  isDuplicate(id: string): boolean {
    this.evictExpired()
    return this.processed.has(id)
  }

  markProcessed(id: string): void {
    this.processed.set(id, { timestamp: Date.now() })
  }

  clear(): void {
    this.processed.clear()
  }

  getProcessedCount(): number {
    this.evictExpired()
    return this.processed.size
  }

  private evictExpired(): void {
    const now = Date.now()
    for (const [id, entry] of this.processed.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.processed.delete(id)
      }
    }
  }
}
