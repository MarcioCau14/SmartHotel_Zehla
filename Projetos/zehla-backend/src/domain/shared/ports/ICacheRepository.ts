import { Result } from '@/shared/Result'

export interface ICacheRepository {
  setNX(key: string, value: string, ttlSeconds: number): Promise<Result<boolean, Error>>
  exists(key: string): Promise<Result<boolean, Error>>
  delete(key: string): Promise<Result<void, Error>>
  clear(): Promise<Result<void, Error>>
  get(key: string): Promise<Result<string | null, Error>>
  set(key: string, value: string, ttlSeconds?: number): Promise<Result<void, Error>>
  incrementByFloat(key: string, value: number, ttlSeconds: number): Promise<Result<number, Error>>
}
