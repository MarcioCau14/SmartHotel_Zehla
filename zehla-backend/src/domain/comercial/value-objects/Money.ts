import { Result } from '../../../shared/Result'

export class Money {
  private constructor(public readonly centavos: number) {
    if (centavos < 0) {
      throw new Error('Money value cannot be negative')
    }
    Object.freeze(this)
  }

  static criar(centavos: number): Result<Money, Error> {
    if (typeof centavos !== 'number' || isNaN(centavos)) {
      return Result.fail(new Error('Invalid money value'))
    }
    if (centavos < 0) {
      return Result.fail(new Error('Money value cannot be negative'))
    }
    return Result.ok(new Money(centavos))
  }

  static deReais(reais: number): Result<Money, Error> {
    if (typeof reais !== 'number' || isNaN(reais)) {
      return Result.fail(new Error('Invalid money value'))
    }
    if (reais < 0) {
      return Result.fail(new Error('Money value cannot be negative'))
    }
    const centavos = Math.round(reais * 100)
    return Result.ok(new Money(centavos))
  }

  static zero(): Money {
    return new Money(0)
  }

  isZero(): boolean {
    return this.centavos === 0
  }

  get valor(): number {
    return this.centavos / 100
  }

  equals(other: Money): boolean {
    return this.centavos === other.centavos
  }

  add(other: Money): Result<Money, Error> {
    try {
      return Result.ok(new Money(this.centavos + other.centavos))
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error adding money'))
    }
  }

  subtract(other: Money): Result<Money, Error> {
    if (other.centavos > this.centavos) {
      return Result.fail(new Error('Subtraction would result in negative value'))
    }
    try {
      return Result.ok(new Money(this.centavos - other.centavos))
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error subtracting money'))
    }
  }

  percentage(percent: number): Result<Money, Error> {
    if (percent < 0 || percent > 100) {
      return Result.fail(new Error('Percentage must be between 0 and 100'))
    }
    const centavos = Math.round((this.centavos * percent) / 100)
    return Result.ok(new Money(centavos))
  }

  multiplicar(fator: number): Result<Money, Error> {
    if (fator < 0) {
      return Result.fail(new Error('Multiplier cannot be negative'))
    }
    const centavos = Math.round(this.centavos * fator)
    return Result.ok(new Money(centavos))
  }

  toString(): string {
    return `R$ ${this.valor.toFixed(2)}`
  }
}