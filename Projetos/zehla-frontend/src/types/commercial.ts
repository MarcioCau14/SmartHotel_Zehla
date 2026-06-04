export type PainVariant = 'FINANCIAL' | 'OPERATIONAL' | 'OCCUPANCY'

export type RegiaoBrasil = 'nordeste' | 'sul' | 'sudeste' | 'norte' | 'centro_oeste'

export type CanalAbordagem = 'ligacao_fria' | 'email_corporativo' | 'whatsapp_optin' | 'indicacao'

export type ConsentimentoLGPD = 'consentimento' | 'legitimo_interesse' | 'sem_consentimento'

export interface PlanoPreco {
  readonly nome: string
  readonly valorPix: number
  readonly valorCartao: number
  readonly trialDias: number
  readonly propriedadesLimite: number
  readonly temWhatsAppNativo: boolean
  readonly temChannelManager: boolean
  readonly temBookingEngine: boolean
  readonly temPmsBasico: boolean
}

export const PLANOS: ReadonlyArray<PlanoPreco> = Object.freeze([
  {
    nome: 'LITE',
    valorPix: 197,
    valorCartao: 247,
    trialDias: 14,
    propriedadesLimite: 1,
    temWhatsAppNativo: true,
    temChannelManager: false,
    temBookingEngine: true,
    temPmsBasico: true,
  },
  {
    nome: 'PRO',
    valorPix: 397,
    valorCartao: 447,
    trialDias: 14,
    propriedadesLimite: 3,
    temWhatsAppNativo: true,
    temChannelManager: true,
    temBookingEngine: true,
    temPmsBasico: true,
  },
  {
    nome: 'MAX',
    valorPix: 697,
    valorCartao: 797,
    trialDias: 14,
    propriedadesLimite: 999,
    temWhatsAppNativo: true,
    temChannelManager: true,
    temBookingEngine: true,
    temPmsBasico: true,
  },
])

export interface MarketConversionRate {
  readonly canal: string
  readonly conversaoMedia: number
  readonly conversaoOtima: number
}

export const CONVERSION_RATES: ReadonlyArray<MarketConversionRate> = Object.freeze([
  { canal: 'ligacao_fria', conversaoMedia: 0.03, conversaoOtima: 0.05 },
  { canal: 'email_corporativo', conversaoMedia: 0.02, conversaoOtima: 0.035 },
  { canal: 'whatsapp_optin', conversaoMedia: 0.0312, conversaoOtima: 0.04 },
  { canal: 'indicacao', conversaoMedia: 0.15, conversaoOtima: 0.30 },
  { canal: 'pagina_vendas', conversaoMedia: 0.02, conversaoOtima: 0.05 },
])

export interface LGPDClassificacao {
  readonly tipoContato: string
  readonly baseLegal: ConsentimentoLGPD
  readonly podeDisparar: boolean
  readonly regras: string
}

export const LGPD_CLASSIFICACOES: ReadonlyArray<LGPDClassificacao> = Object.freeze([
  {
    tipoContato: 'E-mail corporativo',
    baseLegal: 'legitimo_interesse',
    podeDisparar: true,
    regras: 'Opt-out claro, conteúdo relevante, remetente identificado',
  },
  {
    tipoContato: 'E-mail pessoal',
    baseLegal: 'consentimento',
    podeDisparar: false,
    regras: 'Requer opt-in prévio',
  },
  {
    tipoContato: 'WhatsApp de pousada',
    baseLegal: 'legitimo_interesse',
    podeDisparar: true,
    regras: 'Template aprovado pela Meta. SEM disparo em massa não-solicitado.',
  },
  {
    tipoContato: 'WhatsApp pessoal',
    baseLegal: 'consentimento',
    podeDisparar: false,
    regras: 'Requer autorização explícita. Disparo sem autorização = banimento.',
  },
])

export const ESTRATEGIAS_REGIONAIS: ReadonlyArray<{
  readonly regiao: RegiaoBrasil
  readonly altaTemporada: ReadonlyArray<string>
  readonly momentoAbordagem: ReadonlyArray<string>
  readonly dorPrincipal: string
  readonly canalPreferencial: CanalAbordagem
}> = Object.freeze([
  { regiao: 'nordeste', altaTemporada: Object.freeze(['Dezembro', 'Janeiro', 'Fevereiro', 'Março']), momentoAbordagem: Object.freeze(['Setembro', 'Outubro']), dorPrincipal: 'Lotada, precisa de organização', canalPreferencial: 'ligacao_fria' },
  { regiao: 'sul', altaTemporada: Object.freeze(['Dezembro', 'Janeiro', 'Fevereiro', 'Março', 'Julho']), momentoAbordagem: Object.freeze(['Outubro', 'Novembro', 'Junho']), dorPrincipal: 'Concorrência com hotéis grandes', canalPreferencial: 'email_corporativo' },
  { regiao: 'sudeste', altaTemporada: Object.freeze(['Férias escolares', 'Feriados']), momentoAbordagem: Object.freeze(['Contínuo']), dorPrincipal: 'Alta dependência de Booking', canalPreferencial: 'email_corporativo' },
  { regiao: 'norte', altaTemporada: Object.freeze(['Julho', 'Agosto', 'Setembro']), momentoAbordagem: Object.freeze(['Maio', 'Junho']), dorPrincipal: 'Pouca digitalização', canalPreferencial: 'ligacao_fria' },
  { regiao: 'centro_oeste', altaTemporada: Object.freeze(['Julho', 'Férias escolares']), momentoAbordagem: Object.freeze(['Abril', 'Maio', 'Junho']), dorPrincipal: 'Dependência de feiras e eventos', canalPreferencial: 'ligacao_fria' },
])
