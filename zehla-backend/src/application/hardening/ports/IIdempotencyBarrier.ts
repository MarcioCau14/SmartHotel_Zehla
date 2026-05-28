export interface IIdempotencyBarrier {
  checkAndMark(id: string): boolean
  isDuplicate(id: string): boolean
  markProcessed(id: string): void
  clear(): void
  getProcessedCount(): number
}
