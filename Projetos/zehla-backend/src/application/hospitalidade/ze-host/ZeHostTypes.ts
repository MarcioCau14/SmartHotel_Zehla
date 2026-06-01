import type { EscalacaoPackage } from '../ze-concierge/ZeConciergeTypes'
import type { LoopPhase } from '../../../domain/swarm/services/RalphLoop'
import type { EvaluationResult } from '../../../domain/swarm/services/DogmaticEvaluator'

export interface ZeHostInput {
  package: EscalacaoPackage
}

export interface SubagentDelegado {
  id: string
  role: string
  status: string
  goalId: string
  taskDescription: string
}

export interface ZeHostOutput {
  loopId: string
  packageId: string
  goal: string
  phase: LoopPhase
  evaluation: EvaluationResult | null
  subagents: SubagentDelegado[]
  threatEscalation: boolean
  sanitizedFeedback: string
}
