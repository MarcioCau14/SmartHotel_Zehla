import { Result } from '../../../shared/Result'
import { IComercialLeadPort } from '../ports/IComercialLeadPort'
import { ComercialLead } from '../../../domain/comercial/entities/ComercialLead'
import { ProductTier, TierType } from '../../../domain/comercial/value-objects/ProductTier'

export interface RecomendacaoEscada {
  leadId: string
  tierAtual: TierType
  tierRecomendado: TierType
  tipoRecomendacao: 'upsell' | 'cross_sell' | 'downsell' | 'manter' | 'isca'
  justificativa: string
  confidenceScore: number
  nomeProdutoRecomendado: string
}

export class CalcularEscadaDeValorUseCase {
  constructor(private readonly leadPort: IComercialLeadPort) {}

  async execute(leadId: string, tierAtual: TierType): Promise<Result<RecomendacaoEscada, Error>> {
    const busca = await this.leadPort.buscarPorId(leadId)
    if (busca.isFail) return Result.fail(busca.error)
    const lead = busca.value
    if (!lead) return Result.fail(new Error('LEAD_NAO_ENCONTRADO'))

    const score = lead.score
    const icpFit = score?.icpFit ?? 'fora_icp'
    const scoreValor = score?.valor ?? 0
    const estaEngajado = lead.quantidadeInteracoes >= 2

    return Result.ok(this.calcular(lead.id, tierAtual, scoreValor, icpFit, estaEngajado))
  }

  private calcular(
    leadId: string,
    tierAtual: TierType,
    score: number,
    icpFit: string,
    engajado: boolean,
  ): RecomendacaoEscada {
    const ordem: TierType[] = ['isca', 'front_end', 'back_end', 'high_end']
    const idxAtual = ordem.indexOf(tierAtual)

    // ICP ideal + score alto + engajado → upsell
    if (icpFit === 'ideal' && score >= 70 && engajado && idxAtual >= 0 && idxAtual < ordem.length - 1) {
      const tierRecomendado = ordem[idxAtual + 1]
      return {
        leadId,
        tierAtual,
        tierRecomendado,
        tipoRecomendacao: 'upsell',
        justificativa: `Lead ICP ideal (score ${score}) engajado. Upgrade de ${tierAtual} para ${tierRecomendado}.`,
        confidenceScore: 0.9,
        nomeProdutoRecomendado: ProductTier.criar(tierRecomendado).value?.nome ?? tierRecomendado,
      }
    }

    // ICP minimo ou score medio → cross-sell complementar
    if ((icpFit === 'minimo' || (score >= 30 && score < 70)) && idxAtual >= 0) {
      const tierRecomendado: TierType = 'complementar'
      return {
        leadId,
        tierAtual,
        tierRecomendado,
        tipoRecomendacao: 'cross_sell',
        justificativa: `Lead ICP ${icpFit} com score ${score}. Sugerir produto complementar.`,
        confidenceScore: 0.6,
        nomeProdutoRecomendado: ProductTier.criar(tierRecomendado).value?.nome ?? tierRecomendado,
      }
    }

    // ICP fora ou score baixo → downsell para isca
    if (icpFit === 'fora_icp' || score < 30) {
      if (tierAtual === 'isca') {
        return {
          leadId,
          tierAtual,
          tierRecomendado: 'isca',
          tipoRecomendacao: 'manter',
          justificativa: `Lead fora de ICP ou score baixo (${score}). Manter na isca.`,
          confidenceScore: 0.4,
          nomeProdutoRecomendado: 'Isca',
        }
      }
      return {
        leadId,
        tierAtual,
        tierRecomendado: 'isca',
        tipoRecomendacao: 'downsell',
        justificativa: `Lead fora de ICP ou score baixo (${score}). Reduzir para isca.`,
        confidenceScore: 0.5,
        nomeProdutoRecomendado: 'Isca',
      }
    }

    // Caso padrao: manter
    return {
      leadId,
      tierAtual,
      tierRecomendado: tierAtual,
      tipoRecomendacao: 'manter',
      justificativa: `Lead ICP ${icpFit} score ${score}. Manter no plano atual.`,
      confidenceScore: 0.5,
      nomeProdutoRecomendado: ProductTier.criar(tierAtual).value?.nome ?? tierAtual,
    }
  }
}
