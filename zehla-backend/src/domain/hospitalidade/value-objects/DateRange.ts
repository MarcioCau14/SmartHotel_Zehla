import { Result } from '../../shared/Result'

export class DateRange {
  private constructor(
    public readonly dataInicio: Date,
    public readonly dataFim: Date
  ) {
    Object.freeze(this)
  }

  static create(dataInicio: Date, dataFim: Date): Result<DateRange, Error> {
    if (isNaN(dataInicio.getTime())) {
      return Result.fail(new Error('dataInicio is not a valid date'))
    }
    if (isNaN(dataFim.getTime())) {
      return Result.fail(new Error('dataFim is not a valid date'))
    }
    if (dataFim <= dataInicio) {
      return Result.fail(new Error('dataFim must be after dataInicio'))
    }
    if (dataFim.getTime() - dataInicio.getTime() < 24 * 60 * 60 * 1000) {
      return Result.fail(new Error('DateRange must be at least 1 day long'))
    }
    return Result.ok(new DateRange(dataInicio, dataFim))
  }

  static createDayUse(dataInicio: Date): Result<DateRange, Error> {
    if (isNaN(dataInicio.getTime())) {
      return Result.fail(new Error('dataInicio is not a valid date'))
    }
    const dataFim = new Date(dataInicio)
    dataFim.setHours(23, 59, 59, 999)
    return Result.ok(new DateRange(dataInicio, dataFim))
  }

  get noites(): number {
    return Math.round(
      (this.dataFim.getTime() - this.dataInicio.getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  contains(data: Date): boolean {
    return data >= this.dataInicio && data <= this.dataFim
  }

  overlaps(other: DateRange): boolean {
    return this.dataInicio < other.dataFim && this.dataFim > other.dataInicio
  }

  equals(other: DateRange): boolean {
    return (
      this.dataInicio.getTime() === other.dataInicio.getTime() &&
      this.dataFim.getTime() === other.dataFim.getTime()
    )
  }
}
