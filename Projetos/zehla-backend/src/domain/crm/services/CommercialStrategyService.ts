import { Result } from '../../../shared/Result'
import {
  MarketIntelligence,
  CONVERSION_RATES,
  PLANOS,
  PAIN_VARIANTS,
  ESTRATEGIAS_REGIONAIS,
  BENCHMARK_CONCORRENTES,
} from '../models/MarketIntelligence'
import type {
  PlanoPreco,
  RegiaoBrasil,
  CanalAbordagem,
  ConsentimentoLGPD,
  MarketConversionRate,
  PainVariant,
} from '../models/MarketIntelligence'
import { LeadProfile } from '../models/LeadProfile'

export interface RecomendacaoComercial {
  readonly leadId: string
  readonly planoRecomendado: PlanoPreco
  readonly canalPrioritario: CanalAbordagem
  readonly painVariant: PainVariant
  readonly conversaoEstimada: number
  readonly justificativa: string
}

export interface EstrategiaAbordagem {
  readonly canal: CanalAbordagem
  readonly taxaConversao: MarketConversionRate
  readonly limiteDiario: number
  readonly requerAquecimento: boolean
  readonly warmingDias: number
}

export interface PlanejamentoRegional {
  readonly regiao: RegiaoBrasil
  readonly momentoIdeal: string
  readonly campanha: string
  readonly canalRecomendado: CanalAbordagem
}

export class CommercialStrategyService {
  private readonly marketIntel: typeof MarketIntelligence

  constructor() {
    this.marketIntel = MarketIntelligence
  }

  recomendarPlano(lead: LeadProfile): Result<RecomendacaoComercial, Error> {
    const plano = this.marketIntel.melhorPlanoParaLead(
      lead.totalSpentUsd,
      lead.staysCount > 3 ? 2 : 1,
    )

    const canal = this._determinarCanal(lead)
    const pain = this._determinarPainVariant(lead)

    const conversao = this.marketIntel.conversaoEstimada(plano)

    const justificativa = this._gerarJustificativa(lead, plano, canal, pain)

    return Result.ok({
      leadId: lead.id,
      planoRecomendado: plano,
      canalPrioritario: canal,
      painVariant: pain,
      conversaoEstimada: conversao,
      justificativa,
    })
  }

  estrategiaAbordagem(canal: CanalAbordagem): EstrategiaAbordagem | undefined {
    const taxa = CONVERSION_RATES.find((r) => r.canal === canal)
    if (!taxa) return undefined

    const limites: Record<CanalAbordagem, { diario: number; warming: boolean; dias: number }> = {
      ligacao_fria: { diario: 15, warming: false, dias: 0 },
      email_corporativo: { diario: 200, warming: true, dias: 30 },
      whatsapp_optin: { diario: 100, warming: false, dias: 0 },
      indicacao: { diario: 50, warming: false, dias: 0 },
    }

    const limite = limites[canal]

    return {
      canal,
      taxaConversao: taxa,
      limiteDiario: limite.diario,
      requerAquecimento: limite.warming,
      warmingDias: limite.dias,
    }
  }

  planejamentoRegional(regiao: RegiaoBrasil): PlanejamentoRegional | undefined {
    const regiaoData = this.marketIntel.campanhaPorRegiao(regiao)
    if (!regiaoData) return undefined

    return {
      regiao,
      momentoIdeal: regiaoData.momentoAbordagem.join(' e '),
      campanha: `A alta temporada começa em 60 dias. Sua pousada está pronta para receber reservas diretas e parar de repassar 15% para o Booking?`,
      canalRecomendado: regiaoData.canalPreferencial,
    }
  }

  resumoConcorrencia(planoNome: string): string {
    const plano = PLANOS.find((p) => p.nome === planoNome)
    if (!plano) return 'Plano não encontrado.'

    const concorrentesComparaveis = BENCHMARK_CONCORRENTES.filter(
      (c) => Math.abs(c.precoBrl - plano.valorPix) <= 200,
    )

    if (concorrentesComparaveis.length === 0) return 'Sem concorrentes diretos nesta faixa de preço.'

    return concorrentesComparaveis
      .map((c) => {
        const diff = c.temWhatsAppNativo ? '' : ' — sem WhatsApp nativo'
        return `${c.nome} (R$ ${c.precoBrl}/mês)${diff}`
      })
      .join('; ')
  }

  private _determinarCanal(lead: LeadProfile): CanalAbordagem {
    if (lead.tags.includes('indicacao')) return 'indicacao'
    if (lead.email && lead.email.includes('@')) {
      const dominio = lead.email.split('@')[1]?.toLowerCase() ?? ''
      const corporativo = !['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'bol.com.br'].includes(dominio)
      if (corporativo) return 'email_corporativo'
    }
    if (lead.totalSpentUsd > 0) return 'whatsapp_optin'
    return 'ligacao_fria'
  }

  private _determinarPainVariant(lead: LeadProfile): PainVariant {
    if (lead.totalSpentUsd > 500) return 'FINANCIAL'
    if (lead.ltvScore > 50) return 'OPERATIONAL'
    return 'OCCUPANCY'
  }

  private _gerarJustificativa(
    lead: LeadProfile,
    plano: PlanoPreco,
    canal: CanalAbordagem,
    pain: PainVariant,
  ): string {
    const painLabel: Record<PainVariant, string> = {
      FINANCIAL: 'reduzir comissão de OTAs',
      OPERATIONAL: 'automatizar atendimento',
      OCCUPANCY: 'aumentar ocupação na baixa temporada',
    }
    const canalLabel: Record<CanalAbordagem, string> = {
      ligacao_fria: 'ligação telefônica',
      email_corporativo: 'e-mail corporativo',
      whatsapp_optin: 'WhatsApp com opt-in',
      indicacao: 'programa de indicação',
    }

    return `Lead ${lead.nome} — recomendado ${plano.nome} (R$ ${plano.valorPix}/mês) via ${canalLabel[canal]}. Dor primária: ${painLabel[pain]}. Conversão estimada: ${(this.marketIntel.conversaoEstimada(plano) * 100).toFixed(1)}%.`
  }
}
