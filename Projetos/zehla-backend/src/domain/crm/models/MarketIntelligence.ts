import { Result } from '../../../shared/Result'

export type RegiaoBrasil = 'nordeste' | 'sul' | 'sudeste' | 'norte' | 'centro_oeste'

export type CanalAbordagem = 'ligacao_fria' | 'email_corporativo' | 'whatsapp_optin' | 'indicacao'

export type ConsentimentoLGPD = 'consentimento' | 'legitimo_interesse' | 'sem_consentimento'

export type PainVariant = 'FINANCIAL' | 'OPERATIONAL' | 'OCCUPANCY'

export interface PainVariantConfig {
  readonly variant: PainVariant
  readonly emailSubject: string
  readonly pitchMessage: string
  readonly expectedOpenRate: number
  readonly expectedClickRate: number
}

export const PAIN_VARIANTS: ReadonlyArray<PainVariantConfig> = Object.freeze([
  {
    variant: 'FINANCIAL',
    emailSubject: '[Nome da Pousada] — reduzindo comissão do Booking',
    pitchMessage: 'Pare de pagar 15% por reserva pro Booking',
    expectedOpenRate: 0.25,
    expectedClickRate: 0.05,
  },
  {
    variant: 'OPERATIONAL',
    emailSubject: 'Automatize seu atendimento 24h sem equipe extra',
    pitchMessage: 'Automatize seu atendimento 24h sem equipe extra',
    expectedOpenRate: 0.22,
    expectedClickRate: 0.04,
  },
  {
    variant: 'OCCUPANCY',
    emailSubject: 'Aumente sua taxa de ocupação em 25% na baixa temporada',
    pitchMessage: 'Aumente sua taxa de ocupação em 25% na baixa temporada',
    expectedOpenRate: 0.20,
    expectedClickRate: 0.03,
  },
])

export interface MarketConversionRate {
  readonly canal: string
  readonly conversaoMedia: number
  readonly conversaoOtima: number
  readonly fonte: string
}

export const CONVERSION_RATES: ReadonlyArray<MarketConversionRate> = Object.freeze([
  { canal: 'ligacao_fria', conversaoMedia: 0.03, conversaoOtima: 0.05, fonte: 'Benchmarking B2B Brasil 2025/2026' },
  { canal: 'email_corporativo', conversaoMedia: 0.02, conversaoOtima: 0.035, fonte: 'RD Station — Média B2B Brasil' },
  { canal: 'whatsapp_optin', conversaoMedia: 0.0312, conversaoOtima: 0.04, fonte: 'Kimi K2.6 — Mercado Hoteleiro 2025' },
  { canal: 'indicacao', conversaoMedia: 0.15, conversaoOtima: 0.30, fonte: 'SaaS B2B — Programa de Indicação' },
  { canal: 'pagina_vendas', conversaoMedia: 0.02, conversaoOtima: 0.05, fonte: 'Média SaaS B2B Brasil' },
])

export interface PlanoPreco {
  readonly nome: string
  readonly valorPix: number
  readonly valorCartao: number
  readonly posicionamento: string
  readonly trialDias: number
  readonly canalMinimo: string
  readonly propriedadesLimite: number
  readonly iaTemplates: string
  readonly temChannelManager: boolean
  readonly temBookingEngine: boolean
  readonly temWhatsAppNativo: boolean
  readonly temPmsBasico: boolean
}

export const PLANOS: ReadonlyArray<PlanoPreco> = Object.freeze([
  {
    nome: 'LITE',
    valorPix: 197,
    valorCartao: 247,
    posicionamento: 'A Fundação Inteligente — Pare de pagar comissão ao Booking',
    trialDias: 14,
    canalMinimo: 'email_corporativo',
    propriedadesLimite: 1,
    iaTemplates: '30 templates fixos (resposta automática)',
    temChannelManager: false,
    temBookingEngine: true,
    temWhatsAppNativo: true,
    temPmsBasico: true,
  },
  {
    nome: 'PRO',
    valorPix: 397,
    valorCartao: 447,
    posicionamento: 'A Inteligência Ativa — Automação híbrida com IA',
    trialDias: 14,
    canalMinimo: 'whatsapp_optin',
    propriedadesLimite: 3,
    iaTemplates: '100+ templates com auto-matching + sugestão IA',
    temChannelManager: true,
    temBookingEngine: true,
    temWhatsAppNativo: true,
    temPmsBasico: true,
  },
  {
    nome: 'MAX',
    valorPix: 697,
    valorCartao: 797,
    posicionamento: 'O Autopilot Total — IA gera respostas e ajusta preços',
    trialDias: 14,
    canalMinimo: 'whatsapp_optin',
    propriedadesLimite: 999,
    iaTemplates: 'Templates ilimitados + IA gerativa (Kimi K2.6 / Gemma 4)',
    temChannelManager: true,
    temBookingEngine: true,
    temWhatsAppNativo: true,
    temPmsBasico: true,
  },
])

export interface EstrategiaRegional {
  readonly regiao: RegiaoBrasil
  readonly altaTemporada: ReadonlyArray<string>
  readonly momentoAbordagem: ReadonlyArray<string>
  readonly dorPrincipal: string
  readonly canalPreferencial: CanalAbordagem
}

export const ESTRATEGIAS_REGIONAIS: ReadonlyArray<EstrategiaRegional> = Object.freeze([
  {
    regiao: 'nordeste',
    altaTemporada: Object.freeze(['Dezembro', 'Janeiro', 'Fevereiro', 'Março']),
    momentoAbordagem: Object.freeze(['Setembro', 'Outubro']),
    dorPrincipal: 'Lotada, precisa de organização',
    canalPreferencial: 'ligacao_fria',
  },
  {
    regiao: 'sul',
    altaTemporada: Object.freeze(['Dezembro', 'Janeiro', 'Fevereiro', 'Março', 'Julho']),
    momentoAbordagem: Object.freeze(['Outubro', 'Novembro', 'Junho']),
    dorPrincipal: 'Concorrência com hotéis grandes',
    canalPreferencial: 'email_corporativo',
  },
  {
    regiao: 'sudeste',
    altaTemporada: Object.freeze(['Férias escolares', 'Feriados']),
    momentoAbordagem: Object.freeze(['Contínuo']),
    dorPrincipal: 'Alta dependência de Booking',
    canalPreferencial: 'email_corporativo',
  },
  {
    regiao: 'norte',
    altaTemporada: Object.freeze(['Julho', 'Agosto', 'Setembro']),
    momentoAbordagem: Object.freeze(['Maio', 'Junho']),
    dorPrincipal: 'Pouca digitalização',
    canalPreferencial: 'ligacao_fria',
  },
  {
    regiao: 'centro_oeste',
    altaTemporada: Object.freeze(['Julho', 'Férias escolares']),
    momentoAbordagem: Object.freeze(['Abril', 'Maio', 'Junho']),
    dorPrincipal: 'Dependência de feiras e eventos',
    canalPreferencial: 'ligacao_fria',
  },
])

export interface LGPDClassificacao {
  readonly tipoContato: string
  readonly baseLegal: ConsentimentoLGPD
  readonly podeDisparar: boolean
  readonly regras: string
}

export const LGPD_CLASSIFICACOES: ReadonlyArray<LGPDClassificacao> = Object.freeze([
  {
    tipoContato: 'E-mail corporativo (pousada@, contato@, reservas@)',
    baseLegal: 'legitimo_interesse',
    podeDisparar: true,
    regras: 'Opt-out claro, conteúdo relevante, remetente identificado',
  },
  {
    tipoContato: 'E-mail pessoal (@gmail, @hotmail, @outlook)',
    baseLegal: 'consentimento',
    podeDisparar: false,
    regras: 'Requer opt-in prévio. Enviar e-mail único de re-engagement.',
  },
  {
    tipoContato: 'WhatsApp de pousada (número de trabalho público)',
    baseLegal: 'legitimo_interesse',
    podeDisparar: true,
    regras: 'Template aprovado pela Meta. SEM disparo em massa não-solicitado.',
  },
  {
    tipoContato: 'WhatsApp pessoal do dono',
    baseLegal: 'consentimento',
    podeDisparar: false,
    regras: 'Requer autorização explícita. Disparo sem autorização = banimento.',
  },
])

export interface BenchmarkConcorrente {
  readonly nome: string
  readonly precoBrl: number
  readonly temPms: boolean
  readonly temChannelManager: boolean
  readonly temWhatsAppNativo: boolean
  readonly temIaNativa: boolean
  readonly notas: string
}

export const BENCHMARK_CONCORRENTES: ReadonlyArray<BenchmarkConcorrente> = Object.freeze([
  { nome: 'Update247', precoBrl: 29, temPms: true, temChannelManager: true, temWhatsAppNativo: false, temIaNativa: false, notas: 'PMS + Channel Manager básico. Preço mais baixo do mercado.' },
  { nome: 'Little Hotelier', precoBrl: 174, temPms: true, temChannelManager: true, temWhatsAppNativo: false, temIaNativa: false, notas: 'Foco em pequenas pousadas. Sem IA e sem WhatsApp nativo.' },
  { nome: 'eZee Champion', precoBrl: 406, temPms: true, temChannelManager: true, temWhatsAppNativo: false, temIaNativa: false, notas: '130+ canais. WhatsApp é add-on. Concorrente direto do PRO.' },
  { nome: 'Cloudbeds One+', precoBrl: 928, temPms: true, temChannelManager: true, temWhatsAppNativo: false, temIaNativa: false, notas: 'Premium. Guest Messaging é add-on PIE. Caro para pousadas pequenas.' },
  { nome: 'Omnibees', precoBrl: 870, temPms: true, temChannelManager: true, temWhatsAppNativo: true, temIaNativa: true, notas: '750+ canais + CRM + WhatsApp. Concorrente mais próximo do MAX, mas mais caro.' },
])

export class MarketIntelligence {
  static melhorPlanoParaLead(totalSpentUsd: number, numeroPropriedades: number): PlanoPreco {
    if (totalSpentUsd >= 1000 || numeroPropriedades > 3) return PLANOS[2]
    if (totalSpentUsd >= 300 || numeroPropriedades > 1) return PLANOS[1]
    return PLANOS[0]
  }

  static conversaoEstimada(plano: PlanoPreco): number {
    if (plano.valorPix >= 600) return 0.008
    if (plano.valorPix >= 300) return 0.015
    return 0.025
  }

  static receitaEsperada(leadsQualificados: number, plano: PlanoPreco): number {
    const conversion = this.conversaoEstimada(plano)
    const clientes = Math.floor(leadsQualificados * conversion)
    return clientes * plano.valorPix
  }

  static campanhaPorRegiao(regiao: RegiaoBrasil): EstrategiaRegional | undefined {
    return ESTRATEGIAS_REGIONAIS.find((e) => e.regiao === regiao)
  }

  static lgpdPermiteDisparo(tipo: string): LGPDClassificacao | undefined {
    return LGPD_CLASSIFICACOES.find((l) =>
      tipo.toLowerCase().includes(l.tipoContato.toLowerCase().slice(0, 10)),
    )
  }

  static diferencialCompetitivo(): ReadonlyArray<string> {
    return Object.freeze([
      'WhatsApp Business API nativo no PMS — nenhum concorrente entrega de fábrica',
      'IA que responde hóspedes no WhatsApp 24h — diferencial absoluto',
      'Preço fundador vitalício para beta testers — cria lealdade',
      'Foco exclusivo em pousadas pequenas (5-20 quartos) — mercado ignorado por Cloudbeds/SiteMinder',
      'Suporte direto com fundador via WhatsApp — vantagem competitiva contra ticket/24h genérico',
    ])
  }

  static planoParaValor(valor: number): PlanoPreco | undefined {
    return PLANOS.find(
      (p) => p.valorPix === valor || p.valorCartao === valor,
    )
  }

  static receitaProjetada3Meses(leadsPorMes: number): number {
    const planos = PLANOS
    const mix = [0.6, 0.3, 0.1]
    let receita = 0
    for (let mes = 1; mes <= 3; mes++) {
      const leadsCumulativos = leadsPorMes * mes
      for (let i = 0; i < planos.length; i++) {
        const conversao = this.conversaoEstimada(planos[i])
        receita += leadsCumulativos * mix[i] * conversao * planos[i].valorPix
      }
    }
    return Math.floor(receita)
  }
}
