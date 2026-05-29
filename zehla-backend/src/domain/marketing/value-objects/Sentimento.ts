import { Result } from '../../../shared/Result'

export type SentimentoType = 'positivo' | 'neutro' | 'negativo' | 'critico'

const NOTA_CRITICO_MAX = 3
const NOTA_NEGATIVO_MAX = 5
const NOTA_NEUTRO_MAX = 7
const NOTA_POSITIVO_MIN = 8

export class Sentimento {
  private constructor(public readonly value: SentimentoType) {
    Object.freeze(this)
  }

  static criar(nota: number): Result<Sentimento, Error> {
    if (typeof nota !== 'number' || !Number.isFinite(nota) || nota < 1 || nota > 10) {
      return Result.fail(new Error('Nota deve ser um número entre 1 e 10'))
    }
    let value: SentimentoType
    if (nota <= NOTA_CRITICO_MAX) value = 'critico'
    else if (nota <= NOTA_NEGATIVO_MAX) value = 'negativo'
    else if (nota <= NOTA_NEUTRO_MAX) value = 'neutro'
    else value = 'positivo'

    return Result.ok(new Sentimento(value))
  }

  get isCritico(): boolean {
    return this.value === 'critico'
  }

  get isPositivo(): boolean {
    return this.value === 'positivo'
  }

  get isNegativo(): boolean {
    return this.value === 'negativo'
  }
}
