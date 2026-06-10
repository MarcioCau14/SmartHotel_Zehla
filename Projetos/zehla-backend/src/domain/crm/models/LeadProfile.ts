import { Result } from '../../../shared/Result'
import { CRMPipelineStage, ICPersona } from './CRMPipelineStage'

export interface LeadProfileProps {
  id: string
  nome: string
  telefone: string
  email?: string
  canalOrigem: string
  ltvScore: number
  stage: CRMPipelineStage
  createdAt: Date
  propriedadeId: string
  persona?: ICPersona
  totalSpentUsd?: number
  staysCount?: number
  lastInteractionAt?: Date
  bookingValueUsd?: number | null
  assignedCloserId?: string | null
  tags?: string[]
  updatedAt?: Date
  readinessScore?: number | null
  lgpdRiskLevel?: string | null
  roiEstimation?: string | null
}

export class LeadProfile {
  private constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly telefone: string,
    public readonly email: string | undefined,
    public readonly canalOrigem: string,
    public readonly ltvScore: number,
    public readonly stage: CRMPipelineStage,
    public readonly createdAt: Date,
    public readonly propriedadeId: string,
    public readonly persona: ICPersona,
    public readonly totalSpentUsd: number,
    public readonly staysCount: number,
    public readonly lastInteractionAt: Date,
    public readonly bookingValueUsd: number | null,
    public readonly assignedCloserId: string | null,
    public readonly tags: ReadonlyArray<string>,
    public readonly updatedAt: Date,
    public readonly readinessScore: number | null,
    public readonly lgpdRiskLevel: string | null,
    public readonly roiEstimation: string | null,
  ) {
    Object.freeze(this)
  }

  static create(props: LeadProfileProps): Result<LeadProfile, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID do lead é obrigatório'))
    }
    if (!props.nome || props.nome.trim().length === 0) {
      return Result.fail(new Error('Nome do lead é obrigatório'))
    }
    if (!props.telefone || props.telefone.trim().length === 0) {
      return Result.fail(new Error('Telefone do lead é obrigatório'))
    }
    if (props.ltvScore < 0 || props.ltvScore > 100) {
      return Result.fail(new Error('LTV score deve estar entre 0 e 100'))
    }
    if (!props.canalOrigem || props.canalOrigem.trim().length === 0) {
      return Result.fail(new Error('Canal de origem é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }

    const now = new Date()
    return Result.ok(
      new LeadProfile(
        props.id.trim(),
        props.nome.trim(),
        props.telefone.trim(),
        props.email?.trim(),
        props.canalOrigem.trim(),
        props.ltvScore,
        props.stage ?? CRMPipelineStage.ENTRADA,
        props.createdAt ?? now,
        props.propriedadeId.trim(),
        props.persona ?? ICPersona.DESCONHECIDO,
        props.totalSpentUsd ?? 0,
        props.staysCount ?? 0,
        props.lastInteractionAt ?? now,
        props.bookingValueUsd ?? null,
        props.assignedCloserId ?? null,
        Object.freeze([...(props.tags ?? [])]),
        props.updatedAt ?? now,
        props.readinessScore ?? null,
        props.lgpdRiskLevel ?? null,
        props.roiEstimation ?? null,
      ),
    )
  }

  withStage(novoStage: CRMPipelineStage): Result<LeadProfile, Error> {
    return Result.ok(
      new LeadProfile(
        this.id,
        this.nome,
        this.telefone,
        this.email,
        this.canalOrigem,
        this.ltvScore,
        novoStage,
        this.createdAt,
        this.propriedadeId,
        this.persona,
        this.totalSpentUsd,
        this.staysCount,
        this.lastInteractionAt,
        this.bookingValueUsd,
        this.assignedCloserId,
        this.tags,
        new Date(),
        this.readinessScore,
        this.lgpdRiskLevel,
        this.roiEstimation,
      ),
    )
  }

  withReadiness(score: number, risk: string, roi: string): Result<LeadProfile, Error> {
    return Result.ok(
      new LeadProfile(
        this.id,
        this.nome,
        this.telefone,
        this.email,
        this.canalOrigem,
        this.ltvScore,
        this.stage,
        this.createdAt,
        this.propriedadeId,
        this.persona,
        this.totalSpentUsd,
        this.staysCount,
        this.lastInteractionAt,
        this.bookingValueUsd,
        this.assignedCloserId,
        this.tags,
        new Date(),
        score,
        risk,
        roi,
      ),
    )
  }

  get isHighValue(): boolean {
    return this.ltvScore >= 70 || this.totalSpentUsd >= 500
  }

  get isB2B(): boolean {
    return this.persona === ICPersona.PRODUTOR_B2B
  }

  get requiresHumanCloser(): boolean {
    return this.stage === CRMPipelineStage.NEGOCIACAO || this.isB2B
  }

  get daysSinceLastInteraction(): number {
    return Math.floor((Date.now() - this.lastInteractionAt.getTime()) / 86_400_000)
  }
}
