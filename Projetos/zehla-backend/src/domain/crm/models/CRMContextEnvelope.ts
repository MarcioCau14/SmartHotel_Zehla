import { LeadProfile } from './LeadProfile'
import { CRMRoutingConfig, CRM_ROUTING_CONFIGS } from './CRMPipelineStage'

export interface CRMContextSnapshot {
  readonly leadId: string
  readonly stage: string
  readonly persona: string
  readonly ltvScore: number
  readonly isHighValue: boolean
  readonly isB2B: boolean
  readonly requiresHumanCloser: boolean
  readonly originChannel: string
  readonly daysSinceLastInteraction: number
  readonly routingMinTier: number
  readonly stickinessMultiplier: number
  readonly budgetPriority: string
  readonly timestamp: number
}

export class CRMContextEnvelope {
  private constructor(public readonly snapshot: Readonly<CRMContextSnapshot>) {
    Object.freeze(snapshot)
  }

  static fromProfile(profile: LeadProfile): CRMContextEnvelope {
    const config: CRMRoutingConfig = CRM_ROUTING_CONFIGS.get(profile.stage) ?? {
      stage: profile.stage,
      minTier: 2,
      requireHumanEscalation: false,
      stickinessMultiplier: 1.0,
      budgetPriority: 'normal',
    }

    return new CRMContextEnvelope(Object.freeze({
      leadId: profile.id,
      stage: profile.stage,
      persona: profile.persona,
      ltvScore: profile.ltvScore,
      isHighValue: profile.isHighValue,
      isB2B: profile.isB2B,
      requiresHumanCloser: profile.requiresHumanCloser,
      originChannel: profile.canalOrigem,
      daysSinceLastInteraction: profile.daysSinceLastInteraction,
      routingMinTier: config.minTier,
      stickinessMultiplier: config.stickinessMultiplier,
      budgetPriority: config.budgetPriority,
      timestamp: Date.now(),
    }))
  }

  toMetadataEntry(): Readonly<{ key: 'crm'; value: CRMContextSnapshot }> {
    return Object.freeze({ key: 'crm' as const, value: this.snapshot })
  }
}
