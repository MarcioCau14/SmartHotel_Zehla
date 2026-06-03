import { Result } from '../../../shared/Result'

export interface LeadConversionKey {
  readonly originChannel: string
  readonly persona: string
}

export class LeadConversionPosterior {
  private constructor(
    public readonly key: Readonly<LeadConversionKey>,
    public readonly alpha: number,
    public readonly beta: number,
    public readonly nObservations: number,
    public readonly lastUpdateAt: number,
    public readonly totalValueUsd: number,
    public readonly conversionCount: number,
  ) {
    Object.freeze(this)
  }

  static uniform(key: LeadConversionKey): LeadConversionPosterior {
    return new LeadConversionPosterior(
      Object.freeze({ ...key }),
      1.0, 1.0, 0, 0, 0, 0,
    )
  }

  static fromPriors(
    key: LeadConversionKey,
    baseConversionRate: number,
    pseudoCount: number = 20,
  ): LeadConversionPosterior {
    const alpha = baseConversionRate * pseudoCount + 1
    const beta = (1 - baseConversionRate) * pseudoCount + 1
    return new LeadConversionPosterior(
      Object.freeze({ ...key }),
      alpha, beta, 0, 0, 0, 0,
    )
  }

  recordConversion(valueUsd: number): LeadConversionPosterior {
    return new LeadConversionPosterior(
      this.key,
      this.alpha + 1,
      this.beta,
      this.nObservations + 1,
      Date.now(),
      this.totalValueUsd + valueUsd,
      this.conversionCount + 1,
    )
  }

  recordLoss(): LeadConversionPosterior {
    return new LeadConversionPosterior(
      this.key,
      this.alpha,
      this.beta + 1,
      this.nObservations + 1,
      Date.now(),
      this.totalValueUsd,
      this.conversionCount,
    )
  }

  sample(prng: () => number = Math.random): number {
    if (this.alpha > 1 && this.beta > 1) {
      return this._marsagliaTsang(prng)
    }
    return this._johnkAlgorithm(prng)
  }

  get conversionProbability(): number {
    return this.alpha / (this.alpha + this.beta)
  }

  get averageConversionValue(): number {
    return this.conversionCount > 0
      ? this.totalValueUsd / this.conversionCount
      : 0
  }

  get expectedValue(): number {
    return this.conversionProbability * this.averageConversionValue
  }

  private _marsagliaTsang(prng: () => number): number {
    const a = this.alpha
    const b = this.beta
    const d = a - 1 / 3
    const c = 1 / Math.sqrt(9 * d)
    while (true) {
      let x: number
      let v: number
      while (true) {
        x = this._randn(prng)
        v = 1 + c * x
        if (v > 0) break
      }
      v = v * v * v
      const u = prng()
      if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
    }
  }

  private _johnkAlgorithm(prng: () => number): number {
    while (true) {
      const u = Math.pow(prng(), 1 / this.alpha)
      const v = Math.pow(prng(), 1 / this.beta)
      if (u + v <= 1) {
        if (u + v === 0) continue
        return u / (u + v)
      }
    }
  }

  private _randn(prng: () => number): number {
    return Math.sqrt(-2 * Math.log(prng())) * Math.cos(2 * Math.PI * prng())
  }
}

export const ICP_CONVERSION_PRIORS: ReadonlyArray<{
  readonly persona: string
  readonly baseRate: number
}> = Object.freeze([
  { persona: 'hospede_romantico', baseRate: 0.35 },
  { persona: 'familiar_lazer', baseRate: 0.22 },
  { persona: 'produtor_b2b', baseRate: 0.08 },
  { persona: 'desconhecido', baseRate: 0.15 },
])

export function createPosteriorKey(channel: string, persona: string): LeadConversionKey {
  return Object.freeze({ originChannel: channel, persona })
}
