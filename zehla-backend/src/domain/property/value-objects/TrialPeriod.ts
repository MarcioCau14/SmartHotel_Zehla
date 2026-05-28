import { Result } from '../../shared/Result'

export interface TrialPeriodProps {
  startDate: Date
  endDate: Date
  notificationSent: boolean
  isExpired: boolean
}

export class TrialPeriod {
  private constructor(private readonly props: TrialPeriodProps) {
    Object.freeze(this)
  }

  static create(startDate: Date, days: number = 7): Result<TrialPeriod, string> {
    if (startDate > new Date()) {
      return Result.fail('Start date cannot be in the future')
    }
    if (days < 1) {
      return Result.fail('Trial duration must be at least 1 day')
    }

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + days)

    return Result.ok(new TrialPeriod({
      startDate,
      endDate,
      notificationSent: false,
      isExpired: false,
    }))
  }

  static restore(props: TrialPeriodProps): TrialPeriod {
    return new TrialPeriod({ ...props })
  }

  get startDate(): Date { return new Date(this.props.startDate) }
  get endDate(): Date { return new Date(this.props.endDate) }
  get notificationSent(): boolean { return this.props.notificationSent }

  isActive(): boolean {
    if (this.props.isExpired) return false
    const now = new Date()
    return now >= this.props.startDate && now <= this.props.endDate
  }

  isExpired(): boolean {
    if (this.props.isExpired) return true
    return new Date() > this.props.endDate
  }

  daysRemaining(referenceDate?: Date): number {
    const ref = referenceDate ?? new Date()
    const diff = this.props.endDate.getTime() - ref.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  shouldNotifyDay6(referenceDate?: Date): boolean {
    const daysLeft = this.daysRemaining(referenceDate)
    return daysLeft <= 2 && !this.props.notificationSent && !this.isExpired()
  }

  markNotificationSent(): TrialPeriod {
    return new TrialPeriod({
      ...this.props,
      notificationSent: true,
    })
  }

  expire(): TrialPeriod {
    return new TrialPeriod({
      ...this.props,
      isExpired: true,
    })
  }

  equals(other: TrialPeriod): boolean {
    return this.props.startDate.getTime() === other.props.startDate.getTime() &&
      this.props.endDate.getTime() === other.props.endDate.getTime() &&
      this.props.isExpired === other.props.isExpired &&
      this.props.notificationSent === other.props.notificationSent
  }
}
