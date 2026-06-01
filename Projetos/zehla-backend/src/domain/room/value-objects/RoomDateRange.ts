import { Result } from '../../shared/Result'

function normalizeToUTC(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export class RoomDateRange {
  private constructor(
    private readonly _startMs: number,
    private readonly _endMs: number
  ) {
    Object.freeze(this)
  }

  get startDate(): Date {
    return new Date(this._startMs)
  }

  get endDate(): Date {
    return new Date(this._endMs)
  }

  static create(startDate: Date, endDate: Date): Result<RoomDateRange, string> {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      return Result.fail('startDate deve ser uma data válida')
    }
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      return Result.fail('endDate deve ser uma data válida')
    }

    const start = normalizeToUTC(startDate)
    const end = normalizeToUTC(endDate)

    if (end <= start) {
      return Result.fail('endDate deve ser posterior a startDate')
    }
    return Result.ok(new RoomDateRange(start, end))
  }

  get nights(): number {
    return Math.ceil((this._endMs - this._startMs) / (1000 * 60 * 60 * 24))
  }

  overlaps(other: RoomDateRange): boolean {
    return this._startMs < other._endMs && this._endMs > other._startMs
  }

  contains(date: Date): boolean {
    const ms = normalizeToUTC(date)
    return ms >= this._startMs && ms < this._endMs
  }

  containsRange(other: RoomDateRange): boolean {
    return this._startMs <= other._startMs && this._endMs >= other._endMs
  }

  toJSON() {
    return {
      startDate: new Date(this._startMs).toISOString(),
      endDate: new Date(this._endMs).toISOString(),
      nights: this.nights,
    }
  }
}
