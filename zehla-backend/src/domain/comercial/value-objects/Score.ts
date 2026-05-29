import { Result } from '../../../shared/Result'

export class Score {
  private constructor(public readonly value: number) {
    if (value < 0 || value > 100) {
      throw new Error('Score must be between 0 and 100')
    }
    Object.freeze(this)
  }

  static criar(value: number): Result<Score, Error> {
    if (typeof value !== 'number' || isNaN(value)) {
      return Result.fail(new Error('Invalid score value'))
    }
    if (value < 0 || value > 100) {
      return Result.fail(new Error('Score must be between 0 and 100'))
    }
    return Result.ok(new Score(value))
  }

  static zero(): Score {
    return new Score(0)
  }

  static max(): Score {
    return new Score(100)
  }

  isQualificado(): boolean {
    return this.value >= 30
  }

  isAlto(): boolean {
    return this.value >= 70
  }

  isBaixo(): boolean {
    return this.value < 30
  }

  toString(): string {
    return `${this.value}/100`
  }
}