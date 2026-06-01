import { Result } from '../../shared/Result'

export interface OperationalWindowProps {
  checkInHours: number
  cleaningHours: number
}

export class OperationalWindow {
  private constructor(private readonly props: OperationalWindowProps) {
    Object.freeze(this)
  }

  static create(props: Partial<OperationalWindowProps>): Result<OperationalWindow, string> {
    const checkInHours = props.checkInHours ?? 24
    const cleaningHours = props.cleaningHours ?? 3

    if (checkInHours <= 0) {
      return Result.fail('Check-in window must be positive')
    }
    if (checkInHours > 168) {
      return Result.fail('Check-in window cannot exceed 168 hours (7 days)')
    }
    if (cleaningHours <= 0) {
      return Result.fail('Cleaning window must be positive')
    }
    if (cleaningHours > 48) {
      return Result.fail('Cleaning window cannot exceed 48 hours')
    }

    return Result.ok(new OperationalWindow({ checkInHours, cleaningHours }))
  }

  static restore(props: OperationalWindowProps): OperationalWindow {
    return new OperationalWindow({ ...props })
  }

  get checkInHours(): number { return this.props.checkInHours }
  get cleaningHours(): number { return this.props.cleaningHours }

  equals(other: OperationalWindow): boolean {
    return this.props.checkInHours === other.props.checkInHours &&
      this.props.cleaningHours === other.props.cleaningHours
  }
}
