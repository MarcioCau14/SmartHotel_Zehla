import { Result } from '../../shared/Result'
import { Subagent, SubagentResult } from '../entities/Subagent'

export interface ConsensusOption {
  label: string
  votes: number
  subagentIds: string[]
}

export interface ConsensusResult {
  decision: string
  agreement: number
  total: number
  approved: boolean
  options: ConsensusOption[]
}

export type VoteValue = 'yes' | 'no' | 'abstain'

export interface SubagentVote {
  subagentId: string
  value: VoteValue
  rationale: string
}

export class ConsensusEngine {
  reachConsensus(votes: SubagentVote[]): Result<ConsensusResult, string> {
    if (votes.length === 0) {
      return Result.fail('Cannot reach consensus with zero votes')
    }

    const counts = { yes: 0, no: 0, abstain: 0 }
    const yesIds: string[] = []
    const noIds: string[] = []

    for (const vote of votes) {
      counts[vote.value]++
      if (vote.value === 'yes') yesIds.push(vote.subagentId)
      if (vote.value === 'no') noIds.push(vote.subagentId)
    }

    const total = votes.length
    const nonAbstain = total - counts.abstain
    const majority = nonAbstain > 0 ? (counts.yes / nonAbstain) > 0.5 : false

    const options: ConsensusOption[] = [
      { label: 'yes', votes: counts.yes, subagentIds: yesIds },
      { label: 'no', votes: counts.no, subagentIds: noIds },
    ]

    if (counts.abstain > 0) {
      options.push({ label: 'abstain', votes: counts.abstain, subagentIds: [] })
    }

    const decision = majority ? 'yes' : 'no'
    const agreement = nonAbstain > 0 ? counts.yes / nonAbstain : 0

    return Result.ok({
      decision,
      agreement,
      total,
      approved: majority,
      options,
    })
  }

  evaluateSubagentResults(subagents: Subagent[]): Result<ConsensusResult, string> {
    const done = subagents.filter(s => s.status === 'done')
    if (done.length === 0) {
      return Result.fail('No completed subagents to evaluate')
    }

    const votes: SubagentVote[] = done.map(s => {
      const result = s.result as SubagentResult
      return {
        subagentId: s.id,
        value: result.data?.approved === true ? 'yes' : result.data?.approved === false ? 'no' : 'abstain',
        rationale: result.evidence,
      }
    })

    return this.reachConsensus(votes)
  }
}
