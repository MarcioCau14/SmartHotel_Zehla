import { Result } from '../../shared/Result'

export class Money {
  private constructor(public readonly centavos: number) {
    Object.freeze(this)
  }

  static create(centavos: number): Result<Money, Error> {
    if (!Number.isInteger(centavos)) {
      return Result.fail(new Error('Money must be an integer of centavos'))
    }
    if (centavos < 0) {
      return Result.fail(new Error('Money cannot be negative'))
    }
    return Result.ok(new Money(centavos))
  }

  get reais(): number {
    return this.centavos / 100
  }

  add(other: Money): Result<Money, Error> {
    return Money.create(this.centavos + other.centavos)
  }

  subtract(other: Money): Result<Money, Error> {
    return Money.create(this.centavos - other.centavos)
  }

  multiply(factor: number): Result<Money, Error> {
    return Money.create(Math.round(this.centavos * factor))
  }

  isGreaterThan(other: Money): boolean {
    return this.centavos > other.centavos
  }

  isZero(): boolean {
    return this.centavos === 0
  }

  equals(other: Money): boolean {
    return this.centavos === other.centavos
  }
}
