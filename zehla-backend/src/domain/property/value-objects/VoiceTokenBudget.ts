import { Result } from '../../shared/Result'

export class VoiceTokenBudget {
  private constructor(
    public readonly used: number,
    public readonly limit: number
  ) {
    Object.freeze(this)
  }

  static create(limit: number = 100000): Result<VoiceTokenBudget, string> {
    if (limit <= 0) {
      return Result.fail('Token limit must be greater than zero')
    }
    return Result.ok(new VoiceTokenBudget(0, limit))
  }

  static restore(used: number, limit: number): Result<VoiceTokenBudget, string> {
    if (used < 0) {
      return Result.fail('Used tokens cannot be negative')
    }
    if (limit <= 0) {
      return Result.fail('Token limit must be greater than zero')
    }
    if (used > limit) {
      return Result.fail('Used tokens cannot exceed limit')
    }
    return Result.ok(new VoiceTokenBudget(used, limit))
  }

  consume(tokens: number): Result<VoiceTokenBudget, string> {
    if (tokens <= 0) {
      return Result.fail('Tokens to consume must be greater than zero')
    }
    if (this.used + tokens > this.limit) {
      return Result.fail('Token limit exceeded')
    }
    return Result.ok(new VoiceTokenBudget(this.used + tokens, this.limit))
  }

  isExhausted(): boolean {
    return this.used >= this.limit
  }

  remaining(): number {
    return this.limit - this.used
  }

  reset(): VoiceTokenBudget {
    return new VoiceTokenBudget(0, this.limit)
  }

  equals(other: VoiceTokenBudget): boolean {
    return this.used === other.used && this.limit === other.limit
  }
}
