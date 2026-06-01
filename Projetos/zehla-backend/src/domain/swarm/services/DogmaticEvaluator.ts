import { Result } from '../../shared/Result'
import { Subagent } from '../entities/Subagent'
import { ConsensusEngine, ConsensusResult } from './ConsensusEngine'

export interface EvaluationCriteria {
  requiresMajority: boolean
  minEvidenceLength: number
  requiresAllComplete: boolean
}

export interface EvaluationResult {
  approved: boolean
  score: number
  evidenceCount: number
  consensus: ConsensusResult | null
  rejections: string[]
}

export class DogmaticEvaluator {
  private readonly consensusEngine: ConsensusEngine
  private readonly criteria: EvaluationCriteria

  constructor(consensusEngine?: ConsensusEngine, criteria?: Partial<EvaluationCriteria>) {
    this.consensusEngine = consensusEngine ?? new ConsensusEngine()
    this.criteria = {
      requiresMajority: true,
      minEvidenceLength: 20,
      requiresAllComplete: true,
      ...criteria,
    }
  }

  evaluate(
    goal: string,
    subagents: Subagent[],
    options?: { results?: Record<string, unknown> }
  ): Result<EvaluationResult, string> {
    const rejections: string[] = []

    if (this.criteria.requiresAllComplete) {
      const incomplete = subagents.filter(s => !s.isFinished())
      if (incomplete.length > 0) {
        rejections.push(`${incomplete.length} subagent(s) did not complete: ${incomplete.map(s => s.id).join(', ')}`)
      }
    }

    const doneWithResult = subagents.filter(s => s.status === 'done' && s.result !== null)

    if (doneWithResult.length === 0) {
      rejections.push('No subagents returned factual evidence')
      return Result.ok({
        approved: false,
        score: 0,
        evidenceCount: 0,
        consensus: null,
        rejections,
      })
    }

    let totalEvidenceLength = 0
    for (const s of doneWithResult) {
      if (s.result?.evidence) {
        totalEvidenceLength += s.result.evidence.length
      }
    }

    if (totalEvidenceLength < this.criteria.minEvidenceLength) {
      rejections.push(`Insufficient evidence: ${totalEvidenceLength} chars (min ${this.criteria.minEvidenceLength})`)
    }

    const consensusResult = this.consensusEngine.evaluateSubagentResults(subagents)
    let consensus: ConsensusResult | null = null
    if (consensusResult.isOk) {
      consensus = consensusResult.value

      if (this.criteria.requiresMajority && !consensus.approved) {
        rejections.push(`Majority not reached: ${Math.round(consensus.agreement * 100)}% agreement (needs >50%)`)
      }
    } else {
      rejections.push(`Consensus error: ${consensusResult.error}`)
    }

    const evidenceScore = Math.min(totalEvidenceLength / Math.max(this.criteria.minEvidenceLength, 1), 1)
    const consensusScore = consensus?.approved === true ? 1 : 0
    const completionScore = rejections.filter(r => r.includes('did not complete')).length === 0 ? 1 : 0
    const score = Math.round(((evidenceScore + consensusScore + completionScore) / 3) * 100) / 100

    const approved = rejections.length === 0

    return Result.ok({
      approved,
      score,
      evidenceCount: doneWithResult.length,
      consensus,
      rejections,
    })
  }
}
