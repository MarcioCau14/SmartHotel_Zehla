import { Result } from '../../shared/Result'

export class GuestCount {
  private constructor(public readonly value: number) {
    Object.freeze(this)
  }

  static create(value: number): Result<GuestCount, string> {
    if (!Number.isInteger(value)) {
      return Result.fail('Número de hóspedes deve ser um inteiro')
    }
    if (value < 1) {
      return Result.fail('Número de hóspedes deve ser no mínimo 1')
    }
    if (value > 50) {
      return Result.fail('Número de hóspedes excede o máximo permitido (50)')
    }
    return Result.ok(new GuestCount(value))
  }

  exceedsCapacity(capacity: number): boolean {
    return this.value > capacity
  }

  toJSON() {
    return { value: this.value }
  }
}
