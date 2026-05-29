import { Result } from '../../../shared/Result'
import { Percentual } from './Percentual'

export class ElasticidadePreco {
  private constructor(public readonly valor: number) {
    Object.freeze(this)
  }

  static criar(valor: number): Result<ElasticidadePreco, Error> {
    if (typeof valor !== 'number' || isNaN(valor)) {
      return Result.fail(new Error('Valor da elasticidade é inválido'))
    }
    if (valor > 0) {
      return Result.fail(new Error('Elasticidade deve ser menor ou igual a zero (demanda cai quando preço sobe)'))
    }
    return Result.ok(new ElasticidadePreco(valor))
  }

  calcularVariacaoDemanda(variacaoPreco: Percentual): Result<Percentual, Error> {
    const variacaoDemanda = this.valor * variacaoPreco.valor
    return Percentual.criar(Math.abs(variacaoDemanda))
  }

  toString(): string {
    return `${this.valor.toFixed(2)}`
  }

  equals(other: ElasticidadePreco): boolean {
    return this.valor === other.valor
  }
}
