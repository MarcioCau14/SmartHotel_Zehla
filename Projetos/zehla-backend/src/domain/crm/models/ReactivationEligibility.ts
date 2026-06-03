import { Result } from '../../../shared/Result'

export const REACTIVATION_THRESHOLD_DAYS = 180

export class ReactivationEligibility {
  private constructor(
    public readonly isEligible: boolean,
    public readonly daysSinceCheckout: number,
    public readonly checkoutDate: Date,
  ) {
    Object.freeze(this)
  }

  static evaluate(checkoutDate: Date, currentDate: Date): Result<ReactivationEligibility, Error> {
    if (!(checkoutDate instanceof Date) || isNaN(checkoutDate.getTime())) {
      return Result.fail(new Error('checkoutDate deve ser uma data válida'))
    }
    if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) {
      return Result.fail(new Error('currentDate deve ser uma data válida'))
    }

    const diffMs = currentDate.getTime() - checkoutDate.getTime()
    if (diffMs < 0) {
      return Result.fail(new Error('currentDate não pode ser anterior a checkoutDate'))
    }

    const daysSinceCheckout = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const isEligible = daysSinceCheckout > REACTIVATION_THRESHOLD_DAYS

    return Result.ok(new ReactivationEligibility(isEligible, daysSinceCheckout, checkoutDate))
  }
}
