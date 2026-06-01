import { Result } from '../../shared/Result'

export class OccupancyRate {
  private constructor(
    public readonly rate: number,
    public readonly totalRooms: number,
    public readonly occupiedRooms: number
  ) {
    Object.freeze(this)
  }

  static create(totalRooms: number, occupiedRooms: number): Result<OccupancyRate, string> {
    if (!Number.isInteger(totalRooms) || totalRooms < 1) {
      return Result.fail('Total de quartos deve ser um inteiro positivo')
    }
    if (!Number.isInteger(occupiedRooms) || occupiedRooms < 0) {
      return Result.fail('Quartos ocupados deve ser um inteiro não negativo')
    }
    if (occupiedRooms > totalRooms) {
      return Result.fail('Quartos ocupados não pode exceder o total de quartos')
    }

    const rate = totalRooms > 0 ? occupiedRooms / totalRooms : 0
    return Result.ok(new OccupancyRate(rate, totalRooms, occupiedRooms))
  }

  get percentage(): number {
    return Math.round(this.rate * 100)
  }

  isHighOccupancy(): boolean {
    return this.rate >= 0.8
  }

  isLowOccupancy(): boolean {
    return this.rate <= 0.3
  }

  toJSON() {
    return {
      rate: this.rate,
      percentage: this.percentage,
      totalRooms: this.totalRooms,
      occupiedRooms: this.occupiedRooms,
    }
  }
}
