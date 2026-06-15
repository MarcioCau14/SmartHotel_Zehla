import type { IIdempotencyBarrier } from '../../application/hardening/ports/IIdempotencyBarrier'
import { Result } from '../../shared/Result'
import { ICacheRepository } from './ports/ICacheRepository'

export class IdempotencyBarrier implements IIdempotencyBarrier {
  private readonly cacheRepo: ICacheRepository
  private readonly ttlSeconds: number

  constructor(cacheRepo: ICacheRepository, ttlSeconds: number = 86400) {
    this.cacheRepo = cacheRepo
    this.ttlSeconds = ttlSeconds
  }

  async checkAndMark(id: string): Promise<Result<void, Error>> {
    try {
      const key = `idempotency:${id}`
      const result = await this.cacheRepo.setNX(key, 'processed', this.ttlSeconds)

      if (result.isFail) {
        return Result.fail<void, Error>(result.error)
      }

      const isNew = result.value
      if (!isNew) {
        return Result.fail<void, Error>(
          new Error('DUPLICATE_REQUEST: Requisição duplicada detectada pelo escudo de idempotência.')
        )
      }

      return Result.ok<void, Error>(undefined)
    } catch (error: any) {
      return Result.fail<void, Error>(error)
    }
  }

  async isDuplicate(id: string): Promise<boolean> {
    try {
      const key = `idempotency:${id}`
      const result = await this.cacheRepo.exists(key)
      if (result.isFail) {
        return false
      }
      return result.value
    } catch {
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      await this.cacheRepo.clear()
    } catch (error) {
      console.error('Erro ao limpar cache de idempotência:', error)
    }
  }
}
