import { describe, it, expect, beforeEach } from 'vitest'
import { IdempotencyBarrier } from '../../infrastructure/hardening/IdempotencyBarrier'
import { ICacheRepository } from '../../infrastructure/hardening/ports/ICacheRepository'
import { Result } from '../../shared/Result'

class InMemoryCacheRepository implements ICacheRepository {
  private cache = new Map<string, { value: string; expiresAt: number }>()

  async setNX(key: string, value: string, ttlSeconds: number): Promise<Result<boolean, Error>> {
    const now = Date.now()
    const entry = this.cache.get(key)

    if (entry && entry.expiresAt > now) {
      return Result.ok(false)
    }

    this.cache.set(key, {
      value,
      expiresAt: now + (ttlSeconds * 1000),
    })
    return Result.ok(true)
  }

  async exists(key: string): Promise<Result<boolean, Error>> {
    const now = Date.now()
    const entry = this.cache.get(key)
    const exists = !!(entry && entry.expiresAt > now)
    return Result.ok(exists)
  }

  async delete(key: string): Promise<Result<void, Error>> {
    this.cache.delete(key)
    return Result.ok(undefined)
  }

  async clear(): Promise<Result<void, Error>> {
    this.cache.clear()
    return Result.ok(undefined)
  }

  expireKey(key: string): void {
    const entry = this.cache.get(key)
    if (entry) {
      entry.expiresAt = Date.now() - 1000
    }
  }
}

describe('Idempotency Barrier Escudo de Hardening', () => {
  let cacheRepo: InMemoryCacheRepository
  let barrier: IdempotencyBarrier

  beforeEach(() => {
    cacheRepo = new InMemoryCacheRepository()
    barrier = new IdempotencyBarrier(cacheRepo, 60)
  })

  it('deve marcar e permitir primeira requisição com sucesso', async () => {
    const result = await barrier.checkAndMark('req-1')
    expect(result.isOk).toBe(true)
  })

  it('deve bloquear e retornar erro Result.fail em caso de requisição duplicada', async () => {
    const firstResult = await barrier.checkAndMark('req-2')
    expect(firstResult.isOk).toBe(true)

    const secondResult = await barrier.checkAndMark('req-2')
    expect(secondResult.isFail).toBe(true)
    if (secondResult.isFail) {
      expect(secondResult.error.message).toContain('DUPLICATE_REQUEST')
    }
  })

  it('deve permitir requisição novamente se a chave expirar', async () => {
    const firstResult = await barrier.checkAndMark('req-3')
    expect(firstResult.isOk).toBe(true)

    cacheRepo.expireKey('idempotency:req-3')

    const secondResult = await barrier.checkAndMark('req-3')
    expect(secondResult.isOk).toBe(true)
  })
})
