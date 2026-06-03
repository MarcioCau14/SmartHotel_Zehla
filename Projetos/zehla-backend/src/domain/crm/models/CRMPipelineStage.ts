import { Result } from '../../../shared/Result'

export enum CRMPipelineStage {
  ENTRADA = 'ENTRADA',
  QUALIFICACAO = 'QUALIFICACAO',
  PROPOSTA = 'PROPOSTA',
  NEGOCIACAO = 'NEGOCIACAO',
  FECHAMENTO = 'FECHAMENTO',
  PERDA_TEMPORARIA = 'PERDA_TEMPORARIA',
}

export interface CRMRoutingConfig {
  readonly stage: CRMPipelineStage
  readonly minTier: 1 | 2 | 3
  readonly requireHumanEscalation: boolean
  readonly stickinessMultiplier: number
  readonly budgetPriority: 'normal' | 'elevated' | 'critical'
}

export const CRM_ROUTING_CONFIGS: ReadonlyMap<CRMPipelineStage, CRMRoutingConfig> = new Map([
  [CRMPipelineStage.ENTRADA, { stage: CRMPipelineStage.ENTRADA, minTier: 2, requireHumanEscalation: false, stickinessMultiplier: 1.0, budgetPriority: 'normal' }],
  [CRMPipelineStage.QUALIFICACAO, { stage: CRMPipelineStage.QUALIFICACAO, minTier: 2, requireHumanEscalation: false, stickinessMultiplier: 1.3, budgetPriority: 'elevated' }],
  [CRMPipelineStage.PROPOSTA, { stage: CRMPipelineStage.PROPOSTA, minTier: 2, requireHumanEscalation: false, stickinessMultiplier: 1.3, budgetPriority: 'elevated' }],
  [CRMPipelineStage.NEGOCIACAO, { stage: CRMPipelineStage.NEGOCIACAO, minTier: 3, requireHumanEscalation: true, stickinessMultiplier: 1.8, budgetPriority: 'critical' }],
  [CRMPipelineStage.FECHAMENTO, { stage: CRMPipelineStage.FECHAMENTO, minTier: 1, requireHumanEscalation: false, stickinessMultiplier: 1.0, budgetPriority: 'normal' }],
  [CRMPipelineStage.PERDA_TEMPORARIA, { stage: CRMPipelineStage.PERDA_TEMPORARIA, minTier: 2, requireHumanEscalation: false, stickinessMultiplier: 1.0, budgetPriority: 'normal' }],
])

export enum ICPersona {
  HOSPEDE_ROMANTICO = 'hospede_romantico',
  FAMILIAR_LAZER = 'familiar_lazer',
  PRODUTOR_B2B = 'produtor_b2b',
  DESCONHECIDO = 'desconhecido',
}

const TRANSICOES_VALIDAS: Record<CRMPipelineStage, CRMPipelineStage[]> = {
  [CRMPipelineStage.ENTRADA]: [CRMPipelineStage.QUALIFICACAO, CRMPipelineStage.PERDA_TEMPORARIA],
  [CRMPipelineStage.QUALIFICACAO]: [CRMPipelineStage.PROPOSTA, CRMPipelineStage.ENTRADA, CRMPipelineStage.PERDA_TEMPORARIA],
  [CRMPipelineStage.PROPOSTA]: [CRMPipelineStage.NEGOCIACAO, CRMPipelineStage.QUALIFICACAO, CRMPipelineStage.PERDA_TEMPORARIA],
  [CRMPipelineStage.NEGOCIACAO]: [CRMPipelineStage.FECHAMENTO, CRMPipelineStage.PROPOSTA, CRMPipelineStage.PERDA_TEMPORARIA],
  [CRMPipelineStage.FECHAMENTO]: [CRMPipelineStage.ENTRADA],
  [CRMPipelineStage.PERDA_TEMPORARIA]: [CRMPipelineStage.QUALIFICACAO, CRMPipelineStage.ENTRADA],
}

Object.freeze(TRANSICOES_VALIDAS)

export function podeTransitar(atual: CRMPipelineStage, destino: CRMPipelineStage): boolean {
  return TRANSICOES_VALIDAS[atual].includes(destino)
}

export function transitar(atual: CRMPipelineStage, destino: CRMPipelineStage): Result<CRMPipelineStage, Error> {
  if (!podeTransitar(atual, destino)) {
    return Result.fail(new Error(`Transicao invalida: de ${atual} para ${destino}`))
  }
  return Result.ok(destino)
}
