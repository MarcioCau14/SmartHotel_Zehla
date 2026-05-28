import { Result } from '../../shared/Result'
import { SubagentProfile } from '../entities/SubagentProfile'
import { Subagent, SubagentResult } from '../entities/Subagent'
import { SwarmCoordinator } from './SwarmCoordinator'
import { DogmaticEvaluator, EvaluationResult } from './DogmaticEvaluator'
import { ConsensusEngine } from './ConsensusEngine'

export type LoopPhase = 'pending' | 'observing' | 'planning' | 'acting' | 'learning' | 'completed' | 'failed'

export interface Subgoal {
  id: string
  description: string
  requiredRoles: string[]
}

export interface RalphLoopSnapshot {
  id: string
  goal: string
  tenantId: string
  phase: LoopPhase
  subgoals: Subgoal[]
  attempt: number
  maxAttempts: number
  evaluation: EvaluationResult | null
  startedAt: Date
  completedAt: Date | null
}

export class RalphLoop {
  private readonly coordinator: SwarmCoordinator
  private readonly evaluator: DogmaticEvaluator
  private phase: LoopPhase = 'pending'
  private subgoals: Subgoal[] = []
  private attempt = 0
  private readonly maxAttempts = 3
  private evaluation: EvaluationResult | null = null
  private readonly startedAt: Date
  private completedAt: Date | null = null

  constructor(
    public readonly id: string,
    public readonly goal: string,
    public readonly tenantId: string,
    coordinator?: SwarmCoordinator,
    evaluator?: DogmaticEvaluator
  ) {
    this.coordinator = coordinator ?? new SwarmCoordinator()
    this.evaluator = evaluator ?? new DogmaticEvaluator()
    this.startedAt = new Date()
  }

  get currentPhase(): LoopPhase { return this.phase }
  get currentSubgoals(): Subgoal[] { return [...this.subgoals] }
  get currentAttempt(): number { return this.attempt }
  get currentEvaluation(): EvaluationResult | null { return this.evaluation }
  get swarmCoordinator(): SwarmCoordinator { return this.coordinator }

  initiate(): Result<void, string> {
    if (this.phase !== 'pending') {
      return Result.fail(`Cannot initiate loop from phase ${this.phase}`)
    }
    if (!this.goal || this.goal.trim().length < 5) {
      return Result.fail('Goal must be at least 5 characters')
    }
    this.phase = 'observing'
    return Result.ok(undefined)
  }

  observe(): Result<{ context: string }, string> {
    if (this.phase !== 'observing') {
      return Result.fail(`Cannot observe from phase ${this.phase}`)
    }
    this.phase = 'planning'
    return Result.ok({ context: `Context collected for goal: ${this.goal}` })
  }

  plan(): Result<Subgoal[], string> {
    if (this.phase !== 'planning') {
      return Result.fail(`Cannot plan from phase ${this.phase}`)
    }
    if (this.attempt >= this.maxAttempts) {
      return Result.fail(`Max attempts (${this.maxAttempts}) reached`)
    }
    this.attempt++

    this.subgoals = this.subdivideGoal(this.goal)
    if (this.subgoals.length === 0) {
      return Result.fail('Could not subdivide goal into subgoals')
    }
    this.phase = 'acting'
    return Result.ok([...this.subgoals])
  }

  act(): Result<Subagent[], string> {
    if (this.phase !== 'acting') {
      return Result.fail(`Cannot act from phase ${this.phase}`)
    }

    this.coordinator.clear()

    for (const subgoal of this.subgoals) {
      for (const role of subgoal.requiredRoles) {
        const profileResult = SubagentProfile.fromRole(role as never)
        if (profileResult.isFail) continue

        const spawnResult = this.coordinator.spawnSubagent(
          profileResult.value,
          subgoal.id,
          subgoal.description
        )
        if (spawnResult.isFail) continue

        const agent = spawnResult.value
        const startResult = agent.start()
        if (startResult.isOk) {
          agent.complete({
            taskId: subgoal.id,
            data: { approved: true, role, goal: this.goal },
            evidence: `Subagent ${profileResult.value.name} completed task: ${subgoal.description}. Goal: ${this.goal}`,
            completedAt: new Date(),
          })
        }
      }
    }

    this.phase = 'learning'
    return Result.ok(this.coordinator.getActiveSubagents())
  }

  learn(): Result<{ insights: string[] }, string> {
    if (this.phase !== 'learning') {
      return Result.fail(`Cannot learn from phase ${this.phase}`)
    }

    const subagents = this.coordinator.getActiveSubagents()
    const insights: string[] = []

    for (const agent of subagents) {
      if (agent.status === 'done' && agent.result) {
        insights.push(`${agent.profile.name}: ${agent.result.evidence}`)
      }
      if (agent.status === 'failed' && agent.failureReason) {
        insights.push(`${agent.profile.name} failed: ${agent.failureReason}`)
      }
    }

    const evaluationResult = this.evaluator.evaluate(this.goal, subagents)
    if (evaluationResult.isOk) {
      this.evaluation = evaluationResult.value
    }

    if (this.evaluation?.approved === true) {
      this.phase = 'completed'
      this.completedAt = new Date()
    } else {
      this.phase = 'planning'
    }

    return Result.ok({ insights })
  }

  getSnapshot(): RalphLoopSnapshot {
    return {
      id: this.id,
      goal: this.goal,
      tenantId: this.tenantId,
      phase: this.phase,
      subgoals: [...this.subgoals],
      attempt: this.attempt,
      maxAttempts: this.maxAttempts,
      evaluation: this.evaluation,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    }
  }

  private subdivideGoal(goal: string): Subgoal[] {
    const subgoals: Subgoal[] = []

    const lower = goal.toLowerCase()
    let idCounter = 0

    if (lower.includes('preco') || lower.includes('preço') || lower.includes('tarifa') || lower.includes('custo') || lower.includes('pricing') || lower.includes('desconto') || lower.includes('concorren')) {
      subgoals.push({
        id: `sg-${++idCounter}`,
        description: 'Analisar precos de concorrentes e sugerir otimizacao',
        requiredRoles: ['pricing', 'analyst'],
      })
    }

    if (lower.includes('review') || lower.includes('avaliac') || lower.includes('feedback') || lower.includes('opiniao') || lower.includes('satisfacao')) {
      subgoals.push({
        id: `sg-${++idCounter}`,
        description: 'Analisar avaliacoes e extrair insights de satisfacao',
        requiredRoles: ['reviews', 'analyst'],
      })
    }

    if (lower.includes('reserva') || lower.includes('hospede') || lower.includes('check') || lower.includes('concierge') || lower.includes('servico')) {
      subgoals.push({
        id: `sg-${++idCounter}`,
        description: 'Gerenciar reservas e servicos ao hospede',
        requiredRoles: ['concierge'],
      })
    }

    if (lower.includes('relatorio') || lower.includes('analise') || lower.includes('analisar') || lower.includes('metric') || lower.includes('perform') || lower.includes('dados')) {
      subgoals.push({
        id: `sg-${++idCounter}`,
        description: 'Gerar relatorios de analise de dados',
        requiredRoles: ['analyst'],
      })
    }

    if (subgoals.length === 0) {
      subgoals.push({
        id: 'sg-1',
        description: 'Analisar objetivo geral e consolidar dados',
        requiredRoles: ['analyst'],
      })
    }

    return subgoals
  }
}
