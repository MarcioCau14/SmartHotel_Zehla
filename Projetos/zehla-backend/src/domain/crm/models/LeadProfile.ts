import { Result } from '../../../shared/Result'
import { CRMPipelineStage } from './CRMPipelineStage'

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

    return Result.ok(
      new LeadProfile(
        props.id.trim(),
        props.nome.trim(),
        props.telefone.trim(),
        props.email?.trim(),
        props.canalOrigem.trim(),
        props.ltvScore,
        props.stage ?? CRMPipelineStage.ENTRADA,
        props.createdAt ?? new Date(),
        props.propriedadeId.trim(),
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
      ),
    )
  }
}
