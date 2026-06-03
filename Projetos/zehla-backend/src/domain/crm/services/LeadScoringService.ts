import { LeadConversionPosterior, LeadConversionKey, ICP_CONVERSION_PRIORS } from '../models/LeadConversionPosterior'

export interface LeadScoreResult {
  readonly key: Readonly<LeadConversionKey>
  readonly sampledConversionProb: number
  readonly expectedValue: number
  readonly priorityScore: number
  readonly recommendation: 'invest_heavy' | 'invest_moderate' | 'invest_light' | 'skip'
}

export class LeadScoringService {
  private readonly posteriors = new Map<string, LeadConversionPosterior>()

  constructor() {
    const channels = ['whatsapp', 'instagram', 'website', 'booking_ota']
    for (const prior of ICP_CONVERSION_PRIORS) {
      for (const channel of channels) {
        const key: LeadConversionKey = Object.freeze({
          originChannel: channel,
          persona: prior.persona,
        })
        this.posteriors.set(this.makeKey(key), LeadConversionPosterior.fromPriors(key, prior.baseRate))
      }
    }
  }

  scoreLead(
    channel: string,
    persona: string,
    prng: () => number = Math.random,
  ): LeadScoreResult {
    const key: LeadConversionKey = Object.freeze({ originChannel: channel, persona })
    const posterior = this.getOrCreatePosterior(key)
    const sampledProb = posterior.sample(prng)
    const expectedValue = posterior.expectedValue

    const channelMultiplier = channel === 'whatsapp' ? 1.5 : channel === 'instagram' ? 0.8 : 1.0
    const priorityScore = sampledProb * Math.max(expectedValue, 1) * channelMultiplier

    let recommendation: LeadScoreResult['recommendation']
    if (priorityScore >= 5) recommendation = 'invest_heavy'
    else if (priorityScore >= 2) recommendation = 'invest_moderate'
    else if (priorityScore >= 0.5) recommendation = 'invest_light'
    else recommendation = 'skip'

    return Object.freeze({
      key,
      sampledConversionProb: sampledProb,
      expectedValue,
      priorityScore: Math.round(priorityScore * 1000) / 1000,
      recommendation,
    })
  }

  recordConversion(channel: string, persona: string, valueUsd: number): void {
    const key: LeadConversionKey = Object.freeze({ originChannel: channel, persona })
    const posterior = this.getOrCreatePosterior(key)
    this.posteriors.set(this.makeKey(key), posterior.recordConversion(valueUsd))
  }

  recordLoss(channel: string, persona: string): void {
    const key: LeadConversionKey = Object.freeze({ originChannel: channel, persona })
    const posterior = this.getOrCreatePosterior(key)
    this.posteriors.set(this.makeKey(key), posterior.recordLoss())
  }

  getAllPosteriors(): ReadonlyMap<string, LeadConversionPosterior> {
    return new Map(this.posteriors)
  }

  private getOrCreatePosterior(key: LeadConversionKey): LeadConversionPosterior {
    const stored = this.posteriors.get(this.makeKey(key))
    if (stored) return stored
    return LeadConversionPosterior.uniform(key)
  }

  private makeKey(key: LeadConversionKey): string {
    return `${key.originChannel}__${key.persona}`
  }
}
