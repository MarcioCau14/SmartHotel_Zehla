import { Result } from '../../shared/Result'
import { DogmaticValidator } from './DogmaticValidator'

export interface EvolutionConfig {
  populationSize: number
  mutationRate: number
  maxGenerations: number
  convergenceThreshold: number
}

export interface EvolutionResult {
  original: string
  evolved: string
  generationScore: number
  generations: number
  improvement: number
}

export interface ParetoGoal {
  name: string
  weight: number
  evaluate(prompt: string): number
}

export class SelfEvolution {
  private readonly validator: DogmaticValidator
  private readonly config: EvolutionConfig

  constructor(validator?: DogmaticValidator, config?: Partial<EvolutionConfig>) {
    this.validator = validator ?? new DogmaticValidator()
    this.config = {
      populationSize: 10,
      mutationRate: 0.3,
      maxGenerations: 20,
      convergenceThreshold: 0.01,
      ...config,
    }
  }

  evolve(prompt: string, goals: ParetoGoal[]): Result<EvolutionResult> {
    const baseValidation = this.validator.validate(prompt)
    if (baseValidation.isFail) return Result.fail(baseValidation.error)
    if (!baseValidation.value.valid) {
      return Result.fail(
        new Error(`Base prompt violates dogmatic rules: ${baseValidation.value.violations.join(', ')}`)
      )
    }

    let population = this.initializePopulation(prompt)
    let bestPrompt = prompt
    let bestScore = this.evaluatePrompt(prompt, goals)
    let previousBest = bestScore
    let generationsRun = 0

    for (let gen = 0; gen < this.config.maxGenerations; gen++) {
      generationsRun++
      const candidates = this.generateCandidates(population, prompt)

      const scoredCandidates: { prompt: string; score: number }[] = []
      for (const candidate of candidates) {
        const validation = this.validator.validate(candidate)
        if (validation.isOk && validation.value.valid) {
          const score = this.evaluatePrompt(candidate, goals)
          scoredCandidates.push({ prompt: candidate, score })
        }
      }

      if (scoredCandidates.length === 0) break

      scoredCandidates.sort((a, b) => b.score - a.score)

      const topCandidate = scoredCandidates[0]
      if (topCandidate.score > bestScore) {
        bestPrompt = topCandidate.prompt
        bestScore = topCandidate.score
      }

      population = this.selectPopulation(scoredCandidates)

      if (Math.abs(bestScore - previousBest) < this.config.convergenceThreshold) break
      previousBest = bestScore
    }

    const originalScore = this.evaluatePrompt(prompt, goals)
    return Result.ok({
      original: prompt,
      evolved: bestPrompt,
      generationScore: bestScore,
      generations: generationsRun,
      improvement: bestScore - originalScore,
    })
  }

  private initializePopulation(base: string): string[] {
    const population: string[] = [base]
    for (let i = 1; i < this.config.populationSize; i++) {
      population.push(this.mutate(base))
    }
    return population
  }

  private generateCandidates(population: string[], basePrompt: string): string[] {
    const candidates: string[] = [basePrompt]
    for (const individual of population) {
      if (Math.random() < this.config.mutationRate) {
        candidates.push(this.mutate(individual))
      }
      const partnerIndex = Math.floor(Math.random() * population.length)
      const partner = population[partnerIndex]
      if (partner !== individual) {
        candidates.push(this.crossover(individual, partner))
      }
    }
    return candidates
  }

  private selectPopulation(scored: { prompt: string; score: number }[]): string[] {
    const totalScore = scored.reduce((sum, s) => sum + s.score, 0)
    if (totalScore <= 0) return scored.map(s => s.prompt)

    const selected: string[] = []
    const maxAttempts = this.config.populationSize * 3
    let attempts = 0

    while (selected.length < this.config.populationSize && attempts < maxAttempts && scored.length > 0) {
      attempts++
      let r = Math.random() * totalScore
      for (const candidate of scored) {
        r -= candidate.score
        if (r <= 0) {
          if (!selected.includes(candidate.prompt)) {
            selected.push(candidate.prompt)
          }
          break
        }
      }
    }

    if (selected.length === 0) return scored.map(s => s.prompt)
    while (selected.length < this.config.populationSize) {
      const recycled = scored[Math.floor(Math.random() * scored.length)]
      selected.push(recycled.prompt)
    }

    return selected.slice(0, this.config.populationSize)
  }

  private mutate(prompt: string): string {
    const mutations: ((p: string) => string)[] = [
      (p) => p.replace(/\b(ajuda|help|assist)\b/gi, 'assistência'),
      (p) => p.replace(/\b(por favor|please)\b/gi, ''),
      (p) => `${p} Responda em português brasileiro de forma clara e objetiva.`,
      (p) => `Considerando o contexto hoteleiro, ${p.charAt(0).toLowerCase() + p.slice(1)}`,
      (p) => `Com base no ZEHLA SmartHotel, ${p.charAt(0).toLowerCase() + p.slice(1)}`,
    ]
    return mutations[Math.floor(Math.random() * mutations.length)](prompt)
  }

  private crossover(a: string, b: string): string {
    const wordsA = a.split(' ')
    const wordsB = b.split(' ')
    const point = Math.floor(Math.random() * Math.min(wordsA.length, wordsB.length))
    const child = [...wordsA.slice(0, point), ...wordsB.slice(point)].join(' ')
    return child.length > 0 ? child : a
  }

  private evaluatePrompt(prompt: string, goals: ParetoGoal[]): number {
    if (goals.length === 0) return 0
    let score = 0
    let totalWeight = 0
    for (const goal of goals) {
      score += goal.weight * goal.evaluate(prompt)
      totalWeight += goal.weight
    }
    return totalWeight > 0 ? score / totalWeight : 0
  }

  getValidator(): DogmaticValidator {
    return this.validator
  }

  getConfig(): EvolutionConfig {
    return { ...this.config }
  }
}
