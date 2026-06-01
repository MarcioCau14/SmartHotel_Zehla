import { Result } from '../../shared/Result'

export interface BehaviorSignalsProps {
  painPoints?: string
  observacoes?: string
  notes?: string
  estimatedValues?: string
  intentSignals?: string
  buyingBehavior?: string
  conversionProbability?: number
  objectKeywords?: string
  recommendedPitch?: string
}

const MAX_TEXT_LENGTH = 500

export class BehaviorSignals {
  private constructor(
    public readonly painPoints?: string,
    public readonly observacoes?: string,
    public readonly notes?: string,
    public readonly estimatedValues?: string,
    public readonly intentSignals?: string,
    public readonly buyingBehavior?: string,
    public readonly conversionProbability?: number,
    public readonly objectKeywords?: string,
    public readonly recommendedPitch?: string
  ) {
    Object.freeze(this)
  }

  static create(props: BehaviorSignalsProps): Result<BehaviorSignals, string> {
    for (const [key, value] of Object.entries({
      painPoints: props.painPoints,
      observacoes: props.observacoes,
      notes: props.notes,
    })) {
      if (value !== undefined && typeof value === 'string' && value.length > MAX_TEXT_LENGTH) {
        return Result.fail(`${key} excede o limite de ${MAX_TEXT_LENGTH} caracteres`)
      }
    }
    if (
      props.conversionProbability !== undefined &&
      (props.conversionProbability < 0 || props.conversionProbability > 100)
    ) {
      return Result.fail('conversionProbability deve estar entre 0 e 100')
    }
    return Result.ok(
      new BehaviorSignals(
        props.painPoints,
        props.observacoes,
        props.notes,
        props.estimatedValues,
        props.intentSignals,
        props.buyingBehavior,
        props.conversionProbability,
        props.objectKeywords,
        props.recommendedPitch
      )
    )
  }

  toJSON() {
    return {
      painPoints: this.painPoints,
      intentSignals: this.intentSignals,
      conversionProbability: this.conversionProbability,
      observacoes: this.observacoes,
      notes: this.notes,
      estimatedValues: this.estimatedValues,
      buyingBehavior: this.buyingBehavior,
      objectKeywords: this.objectKeywords,
      recommendedPitch: this.recommendedPitch,
    }
  }
}
