import { Result } from '../../../shared/Result'

export const TESE7_WEIGHTS = Object.freeze({
  schema: 0.30,
  format: 0.15,
  sentiment: 0.20,
  keywords: 0.15,
  hallucination: 0.10,
  length: 0.10,
} as const)

export const COMPLIANCE_THRESHOLD = 0.85

export class TranscriptQualityScore {
  private constructor(
    public readonly schemaScore: number,
    public readonly formatScore: number,
    public readonly sentimentScore: number,
    public readonly keywordsScore: number,
    public readonly hallucinationScore: number,
    public readonly lengthScore: number,
    public readonly finalScore: number,
  ) {
    Object.freeze(this)
  }

  static create(scores: {
    schemaScore: number
    formatScore: number
    sentimentScore: number
    keywordsScore: number
    hallucinationScore: number
    lengthScore: number
  }): Result<TranscriptQualityScore, Error> {
    for (const [key, val] of Object.entries(scores)) {
      if (typeof val !== 'number' || isNaN(val) || val < 0 || val > 1) {
        return Result.fail(new Error(`${key} deve ser um número entre 0 e 1`))
      }
    }

    const finalScore =
      scores.schemaScore * TESE7_WEIGHTS.schema +
      scores.formatScore * TESE7_WEIGHTS.format +
      scores.sentimentScore * TESE7_WEIGHTS.sentiment +
      scores.keywordsScore * TESE7_WEIGHTS.keywords +
      scores.hallucinationScore * TESE7_WEIGHTS.hallucination +
      scores.lengthScore * TESE7_WEIGHTS.length

    const rounded = Math.round(finalScore * 100) / 100

    return Result.ok(new TranscriptQualityScore(
      scores.schemaScore,
      scores.formatScore,
      scores.sentimentScore,
      scores.keywordsScore,
      scores.hallucinationScore,
      scores.lengthScore,
      rounded,
    ))
  }

  isCompliant(threshold: number = COMPLIANCE_THRESHOLD): Result<boolean, Error> {
    if (threshold < 0 || threshold > 1) {
      return Result.fail(new Error('Threshold deve estar entre 0 e 1'))
    }
    return Result.ok(this.finalScore > threshold)
  }
}
