import { Result } from '../../../shared/Result'
import { TranscriptQualityScore } from '../models/TranscriptQualityScore'

export interface EvolutionProposal {
  readonly ruleName: string
  readonly currentPrompt: string
  readonly proposedPrompt: string
  readonly reason: string
}

export class EWC_DR {
  guard(
    qualityScore: TranscriptQualityScore,
    proposal: EvolutionProposal,
    threshold: number = 0.85,
  ): Result<EvolutionProposal, Error> {
    if (!proposal || !proposal.ruleName || proposal.ruleName.trim().length === 0) {
      return Result.fail(new Error('Nome da regra de evolução é obrigatório'))
    }

    const compliance = qualityScore.isCompliant(threshold)
    if (compliance.isFail) {
      return Result.fail(compliance.error)
    }

    if (!compliance.value) {
      return Result.fail(new Error(
        `[EWC-DR] Evolução BLOQUEADA para "${proposal.ruleName}": ` +
        `qualidade atual ${qualityScore.finalScore} ≤ limite ${threshold}. ` +
        `Corrija as não-conformidades antes de evoluir o prompt.`,
      ))
    }

    return Result.ok(proposal)
  }
}
