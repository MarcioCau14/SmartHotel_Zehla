import { Result } from '../../shared/Result'

interface DateRangeProps {
  checkIn: Date
  checkOut: Date
}

export class DateRange {
  private constructor(
    public readonly checkIn: Date,
    public readonly checkOut: Date
  ) {
    Object.freeze(this)
  }

  static create(checkIn: Date, checkOut: Date): Result<DateRange, string> {
    if (!(checkIn instanceof Date) || isNaN(checkIn.getTime())) {
      return Result.fail('checkIn deve ser uma data válida')
    }
    if (!(checkOut instanceof Date) || isNaN(checkOut.getTime())) {
      return Result.fail('checkOut deve ser uma data válida')
    }
    if (checkOut <= checkIn) {
      return Result.fail('checkOut deve ser posterior a checkIn')
    }
    if (checkIn < new Date(new Date().toDateString())) {
      return Result.fail('checkIn não pode estar no passado')
    }
    return Result.ok(new DateRange(checkIn, checkOut))
  }

  static createForUpdate(checkIn: Date, checkOut: Date): Result<DateRange, string> {
    if (!(checkIn instanceof Date) || isNaN(checkIn.getTime())) {
      return Result.fail('checkIn deve ser uma data válida')
    }
    if (!(checkOut instanceof Date) || isNaN(checkOut.getTime())) {
      return Result.fail('checkOut deve ser uma data válida')
    }
    if (checkOut <= checkIn) {
      return Result.fail('checkOut deve ser posterior a checkIn')
    }
    return Result.ok(new DateRange(checkIn, checkOut))
  }

  static createFromStrings(checkIn: string, checkOut: string): Result<DateRange, string> {
    const ci = new Date(checkIn)
    const co = new Date(checkOut)
    return DateRange.create(ci, co)
  }

  get nights(): number {
    const diffMs = this.checkOut.getTime() - this.checkIn.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  overlaps(other: DateRange): boolean {
    return this.checkIn < other.checkOut && this.checkOut > other.checkIn
  }

  contains(date: Date): boolean {
    return date >= this.checkIn && date < this.checkOut
  }

  toJSON() {
    return {
      checkIn: this.checkIn.toISOString(),
      checkOut: this.checkOut.toISOString(),
      nights: this.nights,
    }
  }
}
