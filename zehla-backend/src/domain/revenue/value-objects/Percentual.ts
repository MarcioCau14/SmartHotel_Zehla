import { Result } from '../../../shared/Result'
import { Money } from '../../comercial/value-objects/Money'

export class Percentual {
  private constructor(public readonly valor: number) {
    Object.freeze(this)
  }

  static criar(valor: number): Result<Percentual, Error> {
    if (typeof valor !== 'number' || isNaN(valor)) {
      return Result.fail(new Error('Valor do percentual é inválido'))
    }
    if (valor < 0 || valor > 100) {
      return Result.fail(new Error('Percentual deve estar entre 0 e 100'))
    }
    return Result.ok(new Percentual(valor))
  }

  aplicar(base: Money): Result<Money, Error> {
    return base.percentage(this.valor)
  }

  toString(): string {
    return `${this.valor}%`
  }

  equals(other: Percentual): boolean {
    return this.valor === other.valor
  }
}
