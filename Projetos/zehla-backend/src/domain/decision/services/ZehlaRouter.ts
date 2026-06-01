import { Result } from '../../shared/Result'

export type TierLevel = 1 | 2 | 3

export interface TierConfig {
  level: TierLevel
  label: string
  costPerCall: number
  latencyMs: number
}

export const TIERS: Record<TierLevel, TierConfig> = {
  1: { level: 1, label: 'Rules Engine', costPerCall: 0, latencyMs: 1 },
  2: { level: 2, label: 'Routine AI (MiniMax/Llama)', costPerCall: 0.01, latencyMs: 500 },
  3: { level: 3, label: 'Reasoning AI (Claude 3.5)', costPerCall: 0.10, latencyMs: 3000 },
}

export class ThompsonSampler {
  private alpha: Record<TierLevel, number>
  private beta: Record<TierLevel, number>

  constructor() {
    this.alpha = { 1: 10, 2: 5, 3: 3 }
    this.beta = { 1: 2, 2: 3, 3: 5 }
  }

  sample(): TierLevel {
    const scores: { level: TierLevel; score: number }[] = []

    for (const level of [1, 2, 3] as TierLevel[]) {
      const a = this.alpha[level]
      const b = this.beta[level]
      const score = this.betaSample(a, b)
      scores.push({ level, score })
    }

    scores.sort((a, b) => b.score - a.score)
    return scores[0].level
  }

  update(level: TierLevel, success: boolean): void {
    if (success) {
      this.alpha[level] += 1
    } else {
      this.beta[level] += 1
    }
  }

  getStats(): Record<TierLevel, { alpha: number; beta: number; mean: number }> {
    const stats = {} as Record<TierLevel, { alpha: number; beta: number; mean: number }>
    for (const level of [1, 2, 3] as TierLevel[]) {
      const a = this.alpha[level]
      const b = this.beta[level]
      stats[level] = { alpha: a, beta: b, mean: a / (a + b) }
    }
    return stats
  }

  private betaSample(alpha: number, beta: number): number {
    const alphaSample = this.gammaSample(alpha)
    const betaSample = this.gammaSample(beta)
    return alphaSample / (alphaSample + betaSample)
  }

  private gammaSample(shape: number): number {
    if (shape < 1) {
      const u = Math.random()
      return this.gammaSample(shape + 1) * Math.pow(u, 1 / shape)
    }
    const d = shape - 1 / 3
    const c = 1 / Math.sqrt(9 * d)
    while (true) {
      let x: number
      let v: number
      do {
        x = this.normalSample()
        v = 1 + c * x
      } while (v <= 0)
      v = v * v * v
      const u = Math.random()
      if (u < 1 - 0.0331 * (x * x) * (x * x)) {
        return d * v
      }
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v
      }
    }
  }

  private normalSample(): number {
    let u = 0
    let v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }
}

export class BudgetTracker {
  private dailySpent: Map<string, number> = new Map()
  private monthlySpent: Map<string, number> = new Map()
  private readonly dailyLimit: number
  private readonly monthlyLimit: number

  constructor(dailyLimit = 50, monthlyLimit = 1000) {
    this.dailyLimit = dailyLimit
    this.monthlyLimit = monthlyLimit
  }

  canSpend(tenantId: string, amount: number): boolean {
    const daily = this.dailySpent.get(tenantId) ?? 0
    const monthly = this.monthlySpent.get(tenantId) ?? 0
    return (daily + amount) <= this.dailyLimit && (monthly + amount) <= this.monthlyLimit
  }

  spend(tenantId: string, amount: number): Result<void> {
    if (amount === 0) return Result.ok(undefined)
    if (!this.canSpend(tenantId, amount)) {
      return Result.fail(new Error(`Budget exceeded for tenant ${tenantId}`))
    }
    this.dailySpent.set(tenantId, (this.dailySpent.get(tenantId) ?? 0) + amount)
    this.monthlySpent.set(tenantId, (this.monthlySpent.get(tenantId) ?? 0) + amount)
    return Result.ok(undefined)
  }

  getUsage(tenantId: string): { daily: number; monthly: number; dailyLimit: number; monthlyLimit: number } {
    return {
      daily: this.dailySpent.get(tenantId) ?? 0,
      monthly: this.monthlySpent.get(tenantId) ?? 0,
      dailyLimit: this.dailyLimit,
      monthlyLimit: this.monthlyLimit,
    }
  }

  isCircuitBreakerOpen(tenantId: string): boolean {
    const minCost = Math.min(TIERS[2].costPerCall, TIERS[3].costPerCall)
    return !this.canSpend(tenantId, 0.01)
  }

  resetDaily(): void {
    this.dailySpent.clear()
  }

  resetMonthly(): void {
    this.monthlySpent.clear()
    this.dailySpent.clear()
  }
}

export type RequestComplexity = 'simple' | 'routine' | 'complex'

export interface RouterDecision {
  tier: TierLevel
  config: TierConfig
  cost: number
  complexity: RequestComplexity
  circuitBreakerOpen: boolean
}

export class RequestClassifier {
  private simplePatterns: RegExp[] = [
    /^(oi|olá|bom dia|boa tarde|boa noite|obrigado|tudo bem)/i,
    /^(sim|não|ok|pode ser)/i,
    /^(qual\s+o\s+horário|que\s+horas|até\s+que\s+horas)/i,
    /^(como\s+funciona|o\s+que\s+é)/i,
  ]

  private complexPatterns: RegExp[] = [
    /cancelar|cancelamento|reembolso|multa|taxa/i,
    /reclamação|problema|erro|bug|não\s+funciona/i,
    /renegociar|desconto|preço\s+especial|negociação/i,
    /contrato|assinatura|fidelidade|rescisão/i,
    /estratégia|planejamento|previsão|otimizar/i,
  ]

  classify(input: string): RequestComplexity {
    for (const pattern of this.complexPatterns) {
      if (pattern.test(input)) return 'complex'
    }
    for (const pattern of this.simplePatterns) {
      if (pattern.test(input)) return 'simple'
    }
    return 'routine'
  }
}

export class ZehlaRouter {
  private readonly sampler: ThompsonSampler
  private readonly budget: BudgetTracker
  private readonly classifier: RequestClassifier

  constructor(sampler?: ThompsonSampler, budget?: BudgetTracker, classifier?: RequestClassifier) {
    this.sampler = sampler ?? new ThompsonSampler()
    this.budget = budget ?? new BudgetTracker()
    this.classifier = classifier ?? new RequestClassifier()
  }

  async route(input: string, tenantId: string): Promise<Result<RouterDecision>> {
    const complexity = this.classifier.classify(input)

    const tierOverride: Record<RequestComplexity, { min: TierLevel; max: TierLevel }> = {
      simple: { min: 1, max: 1 },
      routine: { min: 2, max: 3 },
      complex: { min: 3, max: 3 },
    }
    const override = tierOverride[complexity]

    const tier = this.sampler.sample()
    const selected = Math.min(Math.max(tier, override.min), override.max) as TierLevel

    const config = TIERS[selected]
    const cost = config.costPerCall

    const circuitBreakerOpen = this.budget.isCircuitBreakerOpen(tenantId)
    if (circuitBreakerOpen) {
      return Result.ok({
        tier: 1,
        config: TIERS[1],
        cost: 0,
        complexity,
        circuitBreakerOpen: true,
      })
    }

    const spendResult = this.budget.spend(tenantId, cost)
    if (spendResult.isFail) {
      return Result.ok({
        tier: 1,
        config: TIERS[1],
        cost: 0,
        complexity,
        circuitBreakerOpen: false,
      })
    }

    return Result.ok({
      tier: selected,
      config,
      cost,
      complexity,
      circuitBreakerOpen: false,
    })
  }

  reportOutcome(tier: TierLevel, success: boolean): void {
    this.sampler.update(tier, success)
  }

  getSampler(): ThompsonSampler {
    return this.sampler
  }

  getBudget(): BudgetTracker {
    return this.budget
  }
}
