import { Result } from '../../../shared/Result'

export class ScoreEngajamento {
  private constructor(public readonly value: number) {
    Object.freeze(this)
  }

  static criar(valor: number): Result<ScoreEngajamento, Error> {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      return Result.fail(new Error('Score de engajamento deve ser um número'))
    }
    if (valor < 0 || valor > 100) {
      return Result.fail(new Error('Score de engajamento deve estar entre 0 e 100'))
    }
    return Result.ok(new ScoreEngajamento(Math.round(valor)))
  }

  get isCritico(): boolean {
    return this.value < 10
  }

  get isExcelente(): boolean {
    return this.value > 90
  }
}
