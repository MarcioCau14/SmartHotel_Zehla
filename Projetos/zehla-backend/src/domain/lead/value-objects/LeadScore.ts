import { Result } from '../../shared/Result'
import { Cluster, deriveCluster } from '../LeadStatus'

export interface LeadScoreProps {
  score: number
  scoreValid?: number
  validationScore?: number
  conversionScore?: number
  validationStatus?: 'pendente' | 'validado' | 'rejeitado'
  qualification?: string
}

export class LeadScore {
  private constructor(
    public readonly score: number,
    public readonly scoreValid?: number,
    public readonly validationScore?: number,
    public readonly conversionScore?: number,
    public readonly validationStatus?: 'pendente' | 'validado' | 'rejeitado',
    public readonly qualification?: string
  ) {
    Object.freeze(this)
  }

  static create(props: LeadScoreProps): Result<LeadScore, string> {
    if (props.score < 0 || props.score > 100) {
      return Result.fail('score deve estar entre 0 e 100')
    }
    if (props.scoreValid !== undefined && (props.scoreValid < 0 || props.scoreValid > 100)) {
      return Result.fail('scoreValid deve estar entre 0 e 100')
    }
    if (props.validationScore !== undefined && (props.validationScore < 0 || props.validationScore > 100)) {
      return Result.fail('validationScore deve estar entre 0 e 100')
    }
    if (props.conversionScore !== undefined && (props.conversionScore < 0 || props.conversionScore > 100)) {
      return Result.fail('conversionScore deve estar entre 0 e 100')
    }
    if (
      props.validationStatus &&
      !['pendente', 'validado', 'rejeitado'].includes(props.validationStatus)
    ) {
      return Result.fail('validationStatus deve ser pendente, validado ou rejeitado')
    }
    return Result.ok(
      new LeadScore(
        props.score,
        props.scoreValid,
        props.validationScore,
        props.conversionScore,
        props.validationStatus,
        props.qualification
      )
    )
  }

  get cluster(): Cluster {
    return deriveCluster(this.score)
  }

  updateScore(newScore: number): Result<LeadScore, string> {
    return LeadScore.create({
      score: newScore,
      scoreValid: this.scoreValid,
      validationScore: this.validationScore,
      conversionScore: this.conversionScore,
      validationStatus: this.validationStatus,
      qualification: this.qualification,
    })
  }

  addScoreDelta(delta: number): Result<LeadScore, string> {
    const clamped = Math.max(0, Math.min(100, this.score + delta))
    return this.updateScore(clamped)
  }

  toJSON() {
    return {
      score: this.score,
      cluster: this.cluster,
      validationStatus: this.validationStatus,
      scoreValid: this.scoreValid,
      validationScore: this.validationScore,
      conversionScore: this.conversionScore,
      qualification: this.qualification,
    }
  }
}
