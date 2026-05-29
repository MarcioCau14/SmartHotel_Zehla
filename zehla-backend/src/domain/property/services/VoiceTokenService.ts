import { Result } from '../../shared/Result'
import { Property } from '../entities/Property'
import { VoiceTokenBudget } from '../value-objects/VoiceTokenBudget'

export interface VoiceTokenStats {
  used: number
  limit: number
  remaining: number
  percentageUsed: number
  isExhausted: boolean
}

export class VoiceTokenService {
  consume(property: Property, count: number): Result<Property, string> {
    const result = property.consumeVoiceTokens(count)
    if (result.isFail) return Result.fail(result.error)
    return Result.ok(property)
  }

  checkBudget(property: Property): Result<VoiceTokenBudget, string> {
    return Result.ok(property.voiceBudget)
  }

  getUsageStats(property: Property): VoiceTokenStats {
    const budget = property.voiceBudget
    return {
      used: budget.used,
      limit: budget.limit,
      remaining: budget.remaining(),
      percentageUsed: budget.limit > 0 ? budget.used / budget.limit : 0,
      isExhausted: budget.isExhausted(),
    }
  }
}
