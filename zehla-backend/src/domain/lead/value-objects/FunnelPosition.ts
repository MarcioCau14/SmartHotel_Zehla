import { Result } from '../../shared/Result'
import { LeadStatus, canTransitionLeadStatus, FunnelStage, canTransitionFunnelStage, BehaviorProfile } from '../LeadStatus'
import { LeadSource, LEAD_SOURCE_VALUES } from '../LeadSource'

export interface FunnelPositionProps {
  status: LeadStatus
  funnelStage: FunnelStage
  source: LeadSource
  previousCluster?: string
  tierSugerido?: string
  tierConfidence?: number
  behavioralProfile?: string
}

export class FunnelPosition {
  private constructor(
    public readonly status: LeadStatus,
    public readonly funnelStage: FunnelStage,
    public readonly source: LeadSource,
    public readonly previousCluster?: string,
    public readonly tierSugerido?: string,
    public readonly tierConfidence?: number,
    public readonly behavioralProfile?: string
  ) {
    Object.freeze(this)
  }

  static create(props: FunnelPositionProps): Result<FunnelPosition, string> {
    if (!LEAD_SOURCE_VALUES.includes(props.source)) {
      return Result.fail(`Fonte inválida: ${props.source}`)
    }
    if (
      props.tierConfidence !== undefined &&
      (props.tierConfidence < 0 || props.tierConfidence > 100)
    ) {
      return Result.fail('tierConfidence deve estar entre 0 e 100')
    }
    return Result.ok(
      new FunnelPosition(
        props.status,
        props.funnelStage,
        props.source,
        props.previousCluster,
        props.tierSugerido,
        props.tierConfidence,
        props.behavioralProfile
      )
    )
  }

  static initial(source: LeadSource = 'SECRETARIA_AI'): Result<FunnelPosition, string> {
    return FunnelPosition.create({
      status: LeadStatus.PROSPECT,
      funnelStage: 'NEUTRAL',
      source,
    })
  }

  transitionStatus(target: LeadStatus): Result<FunnelPosition, string> {
    if (!canTransitionLeadStatus(this.status, target)) {
      return Result.fail(`Não é possível transicionar de ${this.status} para ${target}`)
    }
    return FunnelPosition.create({
      ...this,
      status: target,
    })
  }

  transitionStage(target: FunnelStage): Result<FunnelPosition, string> {
    if (!canTransitionFunnelStage(this.funnelStage, target)) {
      return Result.fail(
        `Não é possível regredir de ${this.funnelStage} para ${target}`
      )
    }
    return FunnelPosition.create({
      ...this,
      funnelStage: target,
    })
  }

  toJSON() {
    return {
      status: this.status,
      funnelStage: this.funnelStage,
      source: this.source,
      cluster: 'DERIVED',
      tierSugerido: this.tierSugerido,
      tierConfidence: this.tierConfidence,
      behavioralProfile: this.behavioralProfile,
    }
  }
}
