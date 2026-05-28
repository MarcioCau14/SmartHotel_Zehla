import { Result } from '../../shared/Result'

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    Object.freeze(this)
  }

  static create(amount: number, currency: string = 'BRL'): Result<Money, string> {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return Result.fail('Monetary value must be a valid number')
    }
    if (amount < 0) {
      return Result.fail('Monetary value cannot be negative')
    }
    if (!currency || currency.length !== 3) {
      return Result.fail('Currency must be a 3-character ISO 4217 code')
    }
    const rounded = Math.round(amount * 100) / 100
    return Result.ok(new Money(rounded, currency.toUpperCase()))
  }

  static zero(currency: string = 'BRL'): Money {
    return new Money(0, currency.toUpperCase())
  }

  add(other: Money): Result<Money, string> {
    if (this.currency !== other.currency) {
      return Result.fail('Cannot add different currencies')
    }
    return Result.ok(
      new Money(
        Math.round((this.amount + other.amount) * 100) / 100,
        this.currency
      )
    )
  }

  subtract(other: Money): Result<Money, string> {
    if (this.currency !== other.currency) {
      return Result.fail('Cannot subtract different currencies')
    }
    if (other.amount > this.amount) {
      return Result.fail('Insufficient balance for subtraction')
    }
    return Result.ok(
      new Money(
        Math.round((this.amount - other.amount) * 100) / 100,
        this.currency
      )
    )
  }

  multiply(factor: number): Money {
    if (factor < 0) return Money.zero(this.currency)
    return new Money(
      Math.round((this.amount * factor) * 100) / 100,
      this.currency
    )
  }

  percentage(pct: number): Money {
    if (pct < 0 || pct > 100) return Money.zero(this.currency)
    return new Money(
      Math.round((this.amount * pct / 100) * 100) / 100,
      this.currency
    )
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount
  }

  isZero(): boolean {
    return this.amount === 0
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  toNumber(): number {
    return this.amount
  }
}
