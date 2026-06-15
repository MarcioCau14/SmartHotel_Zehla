import { Result } from '../../../shared/Result'

export interface IIdempotencyBarrier {
  checkAndMark(id: string): Promise<Result<void, Error>>
  isDuplicate(id: string): Promise<boolean>
  clear(): Promise<void>
}

