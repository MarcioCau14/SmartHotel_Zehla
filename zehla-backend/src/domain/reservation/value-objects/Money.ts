import { Result } from '../../shared/Result'

export class Money {
  private constructor(
    public readonly amount: number
  ) {
    Object.freeze(this)
  }

  static create(amount: number): Result<Money, string> {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return Result.fail('Valor monetário deve ser um número válido')
    }
    if (amount < 0) {
      return Result.fail('Valor monetário não pode ser negativo')
    }
    const rounded = Math.round(amount * 100) / 100
    return Result.ok(new Money(rounded))
  }

  static ZERO = new Money(0)

  add(other: Money): Money {
    return new Money(Math.round((this.amount + other.amount) * 100) / 100)
  }

  subtract(other: Money): Result<Money, string> {
    if (other.amount > this.amount) {
      return Result.fail('Saldo insuficiente para subtração')
    }
    return Result.ok(new Money(Math.round((this.amount - other.amount) * 100) / 100))
  }

  multiply(factor: number): Money {
    if (factor < 0) return Money.ZERO
    return new Money(Math.round((this.amount * factor) * 100) / 100)
  }

  isZero(): boolean {
    return this.amount === 0
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount
  }

  toJSON() {
    return { amount: this.amount }
  }
}
