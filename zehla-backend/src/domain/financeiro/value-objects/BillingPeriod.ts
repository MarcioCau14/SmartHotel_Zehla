import { Result } from '../../shared/Result'

export class BillingPeriod {
  private constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly reference: string
  ) {
    Object.freeze(this)
  }

  static create(startDate: Date, endDate: Date): Result<BillingPeriod, string> {
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return Result.fail('Invalid dates')
    }

    const start = new Date(Date.UTC(
      startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()
    ))
    const end = new Date(Date.UTC(
      endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()
    ))

    if (start.getTime() >= end.getTime()) {
      return Result.fail('startDate must be before endDate')
    }

    const reference = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`
    return Result.ok(new BillingPeriod(start, end, reference))
  }

  nights(): number {
    const diffMs = this.endDate.getTime() - this.startDate.getTime()
    return Math.round(diffMs / (1000 * 60 * 60 * 24))
  }
}
