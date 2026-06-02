import { Result } from '../../../shared/Result'

export enum CRMPipelineStage {
  ENTRADA = 'ENTRADA',
  QUALIFICACAO = 'QUALIFICACAO',
  PROPOSTA = 'PROPOSTA',
  NEGOCIACAO = 'NEGOCIACAO',
  FECHAMENTO = 'FECHAMENTO',
  PERDA_TEMPORARIA = 'PERDA_TEMPORARIA',
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
    return Result.fail(
      new Error(`Transicao invalida: de ${atual} para ${destino}`),
    )
  }
  return Result.ok(destino)
}
