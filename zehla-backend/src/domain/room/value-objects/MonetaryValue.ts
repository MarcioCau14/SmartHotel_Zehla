import { Result } from '../../shared/Result'

export class MonetaryValue {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    Object.freeze(this)
  }

  static create(amount: number, currency: string = 'BRL'): Result<MonetaryValue, string> {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return Result.fail('Valor monetário deve ser um número válido')
    }
    if (amount < 0) {
      return Result.fail('Valor monetário não pode ser negativo')
    }
    if (!currency || currency.length !== 3) {
      return Result.fail('Moeda deve ser um código ISO 4217 de 3 caracteres')
    }
    const rounded = Math.round(amount * 100) / 100
    return Result.ok(new MonetaryValue(rounded, currency.toUpperCase()))
  }

  static ZERO = new MonetaryValue(0, 'BRL')

  add(other: MonetaryValue): Result<MonetaryValue, string> {
    if (this.currency !== other.currency) {
      return Result.fail('Moedas diferentes não podem ser somadas')
    }
    return Result.ok(
      new MonetaryValue(
        Math.round((this.amount + other.amount) * 100) / 100,
        this.currency
      )
    )
  }

  subtract(other: MonetaryValue): Result<MonetaryValue, string> {
    if (this.currency !== other.currency) {
      return Result.fail('Moedas diferentes não podem ser subtraídas')
    }
    if (other.amount > this.amount) {
      return Result.fail('Saldo insuficiente para subtração')
    }
    return Result.ok(
      new MonetaryValue(
        Math.round((this.amount - other.amount) * 100) / 100,
        this.currency
      )
    )
  }

  multiply(factor: number): MonetaryValue {
    if (factor < 0) return MonetaryValue.ZERO
    return new MonetaryValue(
      Math.round((this.amount * factor) * 100) / 100,
      this.currency
    )
  }

  isZero(): boolean {
    return this.amount === 0
  }

  isGreaterThan(other: MonetaryValue): boolean {
    return this.amount > other.amount
  }

  toJSON() {
    return { amount: this.amount, currency: this.currency }
  }
}
