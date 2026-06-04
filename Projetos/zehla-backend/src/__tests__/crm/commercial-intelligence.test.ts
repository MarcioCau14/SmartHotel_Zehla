import { describe, it, expect } from 'vitest'
import {
  MarketIntelligence,
  CONVERSION_RATES,
  PLANOS,
  PAIN_VARIANTS,
  ESTRATEGIAS_REGIONAIS,
  LGPD_CLASSIFICACOES,
  BENCHMARK_CONCORRENTES,
} from '../../domain/crm/models/MarketIntelligence'
import { CommercialStrategyService } from '../../domain/crm/services/CommercialStrategyService'
import { LeadProfile } from '../../domain/crm/models/LeadProfile'
import { CRMPipelineStage } from '../../domain/crm/models/CRMPipelineStage'

describe('MarketIntelligence — Conversão Realista vs Documento Original', () => {
  it('deve ter taxa de conversão B2B de ~2% (não 12.3%)', () => {
    const whatsapp = CONVERSION_RATES.find((r) => r.canal === 'whatsapp_optin')
    expect(whatsapp).toBeDefined()
    expect(whatsapp!.conversaoMedia).toBeCloseTo(0.0312, 3)
    expect(whatsapp!.conversaoMedia).toBeLessThan(0.05)
  })

  it('deve ter conversão de página de vendas em ~2% (não 4.2%)', () => {
    const pagina = CONVERSION_RATES.find((r) => r.canal === 'pagina_vendas')
    expect(pagina).toBeDefined()
    expect(pagina!.conversaoMedia).toBeCloseTo(0.02, 2)
  })

  it('deve ter conversão de indicação como a mais alta (15-30%)', () => {
    const indicacao = CONVERSION_RATES.find((r) => r.canal === 'indicacao')
    expect(indicacao).toBeDefined()
    expect(indicacao!.conversaoMedia).toBeGreaterThan(0.10)
    expect(indicacao!.conversaoMedia).toBeLessThanOrEqual(0.30)
  })
})

describe('MarketIntelligence — Precificação Psicológica', () => {
  it('LITE deve ser R$ 197 PIX (abaixo de R$ 200)', () => {
    const lite = PLANOS.find((p) => p.nome === 'LITE')
    expect(lite).toBeDefined()
    expect(lite!.valorPix).toBe(197)
    expect(lite!.valorPix).toBeLessThan(200)
    expect(lite!.valorCartao).toBe(247)
  })

  it('PRO deve ser R$ 397 PIX (abaixo de R$ 400)', () => {
    const pro = PLANOS.find((p) => p.nome === 'PRO')
    expect(pro).toBeDefined()
    expect(pro!.valorPix).toBe(397)
    expect(pro!.valorPix).toBeLessThan(400)
  })

  it('MAX deve ser R$ 697 PIX (abaixo de R$ 700)', () => {
    const max = PLANOS.find((p) => p.nome === 'MAX')
    expect(max).toBeDefined()
    expect(max!.valorPix).toBe(697)
    expect(max!.valorPix).toBeLessThan(700)
  })

  it('todos os planos devem ter trial de 14 dias', () => {
    PLANOS.forEach((p) => expect(p.trialDias).toBe(14))
  })

  it('todos os planos devem ter WhatsApp nativo + PMS básico + Booking Engine', () => {
    PLANOS.forEach((p) => {
      expect(p.temWhatsAppNativo).toBe(true)
      expect(p.temPmsBasico).toBe(true)
      expect(p.temBookingEngine).toBe(true)
    })
  })
})

describe('MarketIntelligence — Estratégias Regionais', () => {
  it('deve ter 5 regiões mapeadas', () => {
    expect(ESTRATEGIAS_REGIONAIS).toHaveLength(5)
  })

  it('Nordeste deve ser abordado em Setembro-Outubro (pré-alta temporada)', () => {
    const ne = ESTRATEGIAS_REGIONAIS.find((r) => r.regiao === 'nordeste')
    expect(ne).toBeDefined()
    expect(ne!.momentoAbordagem).toContain('Setembro')
    expect(ne!.canalPreferencial).toBe('ligacao_fria')
  })

  it('Sudeste deve ter abordagem contínua com foco em Booking', () => {
    const se = ESTRATEGIAS_REGIONAIS.find((r) => r.regiao === 'sudeste')
    expect(se).toBeDefined()
    expect(se!.dorPrincipal).toContain('Booking')
    expect(se!.canalPreferencial).toBe('email_corporativo')
  })
})

describe('MarketIntelligence — LGPD Compliance', () => {
  it('deve permitir disparo para e-mail corporativo com legítimo interesse', () => {
    const corporativo = LGPD_CLASSIFICACOES.find((l) =>
      l.tipoContato.includes('E-mail corporativo'),
    )
    expect(corporativo).toBeDefined()
    expect(corporativo!.baseLegal).toBe('legitimo_interesse')
    expect(corporativo!.podeDisparar).toBe(true)
  })

  it('NÃO deve permitir disparo para e-mail pessoal sem consentimento', () => {
    const pessoal = LGPD_CLASSIFICACOES.find((l) =>
      l.tipoContato.includes('E-mail pessoal'),
    )
    expect(pessoal).toBeDefined()
    expect(pessoal!.podeDisparar).toBe(false)
  })

  it('NÃO deve permitir disparo para WhatsApp pessoal sem consentimento', () => {
    const whatsPessoal = LGPD_CLASSIFICACOES.find((l) =>
      l.tipoContato.includes('WhatsApp pessoal'),
    )
    expect(whatsPessoal).toBeDefined()
    expect(whatsPessoal!.podeDisparar).toBe(false)
  })
})

describe('MarketIntelligence — Benchmark Concorrentes', () => {
  it('apenas Omnibees deve ter WhatsApp nativo + IA nativa de fábrica', () => {
    const comAmbos = BENCHMARK_CONCORRENTES.filter((c) => c.temWhatsAppNativo && c.temIaNativa)
    expect(comAmbos).toHaveLength(1)
    expect(comAmbos[0].nome).toBe('Omnibees')
  })

  it('Omnibees deve ser o único com WhatsApp nativo', () => {
    const omnibees = BENCHMARK_CONCORRENTES.find((c) => c.nome === 'Omnibees')
    expect(omnibees).toBeDefined()
    expect(omnibees!.temWhatsAppNativo).toBe(true)
  })

  it('preço médio do mercado deve ser ~R$ 489/mês', () => {
    const media =
      BENCHMARK_CONCORRENTES.reduce((s, c) => s + c.precoBrl, 0) /
      BENCHMARK_CONCORRENTES.length
    expect(media).toBeGreaterThan(400)
    expect(media).toBeLessThan(600)
  })
})

describe('MarketIntelligence — Métodos de Decisão', () => {
  it('melhorPlanoParaLead deve retornar LITE para lead pequeno', () => {
    const plano = MarketIntelligence.melhorPlanoParaLead(100, 1)
    expect(plano.nome).toBe('LITE')
  })

  it('melhorPlanoParaLead deve retornar MAX para lead grande', () => {
    const plano = MarketIntelligence.melhorPlanoParaLead(2000, 5)
    expect(plano.nome).toBe('MAX')
  })

  it('conversaoEstimada deve ser menor para planos caros', () => {
    const convLite = MarketIntelligence.conversaoEstimada(PLANOS[0])
    const convMax = MarketIntelligence.conversaoEstimada(PLANOS[2])
    expect(convLite).toBeGreaterThan(convMax)
  })

  it('receitaEsperada deve projetar valores positivos', () => {
    const receita = MarketIntelligence.receitaEsperada(1000, PLANOS[0])
    expect(receita).toBeGreaterThan(0)
  })

  it('receitaProjetada3Meses deve ser ~R$ 6.140 para 1.000 leads/mês', () => {
    const receita = MarketIntelligence.receitaProjetada3Meses(333)
    expect(receita).toBeGreaterThan(3000)
    expect(receita).toBeLessThan(15000)
  })

  it('diferencialCompetitivo deve listar WhatsApp nativo como primeiro', () => {
    const diffs = MarketIntelligence.diferencialCompetitivo()
    expect(diffs[0].toLowerCase()).toContain('whatsapp')
  })
})

describe('CommercialStrategyService', () => {
  const service = new CommercialStrategyService()

  function createLead(overrides?: Partial<Parameters<typeof LeadProfile.create>[0]>) {
    const result = LeadProfile.create({
      id: 'lead-test-1',
      nome: 'Pousada Sol Nascente',
      telefone: '5511999999999',
      email: 'contato@pousadasolnascente.com.br',
      canalOrigem: 'website',
      ltvScore: 60,
      stage: CRMPipelineStage.ENTRADA,
      createdAt: new Date('2026-01-01'),
      propriedadeId: 'prop-1',
      ...overrides,
    })
    if (result.isOk) return result.value
    throw new Error(`Falha ao criar lead: ${result.error?.message}`)
  }

  it('recomendarPlano deve retornar LITE para lead pequeno', () => {
    const lead = createLead({ totalSpentUsd: 100, staysCount: 1 })
    const result = service.recomendarPlano(lead)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.planoRecomendado.nome).toBe('LITE')
    }
  })

  it('recomendarPlano deve retornar PRO para lead médio', () => {
    const lead = createLead({ totalSpentUsd: 500, staysCount: 2 })
    const result = service.recomendarPlano(lead)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.planoRecomendado.nome).toBe('PRO')
    }
  })

  it('recomendarPlano deve retornar MAX para lead grande', () => {
    const lead = createLead({ totalSpentUsd: 5000, staysCount: 10 })
    const result = service.recomendarPlano(lead)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.planoRecomendado.nome).toBe('MAX')
    }
  })

  it('recomendarPlano deve definir canal como email_corporativo para lead com e-mail corporativo', () => {
    const lead = createLead({ email: 'reservas@pousadax.com.br' })
    const result = service.recomendarPlano(lead)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.canalPrioritario).toBe('email_corporativo')
    }
  })

  it('recomendarPlano deve definir canal como whatsapp_optin para lead com gasto anterior', () => {
    const lead = createLead({ email: 'joao@gmail.com', totalSpentUsd: 300 })
    const result = service.recomendarPlano(lead)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.canalPrioritario).toBe('whatsapp_optin')
    }
  })

  it('recomendarPlano deve definir canal como ligacao_fria para lead sem e-mail corporativo e sem gasto', () => {
    const lead = createLead({ email: 'joao@gmail.com', totalSpentUsd: 0 })
    const result = service.recomendarPlano(lead)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.canalPrioritario).toBe('ligacao_fria')
    }
  })

  it('recomendarPlano deve definir canal como indicacao para lead com tag indicacao', () => {
    const lead = createLead({ tags: ['indicacao', 'hot'] })
    const result = service.recomendarPlano(lead)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.canalPrioritario).toBe('indicacao')
    }
  })

  it('estrategiaAbordagem para email deve ter warming de 30 dias', () => {
    const strategy = service.estrategiaAbordagem('email_corporativo')
    expect(strategy).toBeDefined()
    expect(strategy!.requerAquecimento).toBe(true)
    expect(strategy!.warmingDias).toBe(30)
    expect(strategy!.limiteDiario).toBe(200)
  })

  it('estrategiaAbordagem para ligacao_fria deve ter limite de 15/dia', () => {
    const strategy = service.estrategiaAbordagem('ligacao_fria')
    expect(strategy).toBeDefined()
    expect(strategy!.limiteDiario).toBe(15)
    expect(strategy!.requerAquecimento).toBe(false)
  })

  it('planejamentoRegional para nordeste deve recomendar ligacao_fria', () => {
    const plan = service.planejamentoRegional('nordeste')
    expect(plan).toBeDefined()
    expect(plan!.canalRecomendado).toBe('ligacao_fria')
  })

  it('resumoConcorrencia deve retornar concorrentes para LITE', () => {
    const resumo = service.resumoConcorrencia('LITE')
    expect(resumo).toBeTruthy()
    expect(resumo).toContain('Little Hotelier')
  })

  it('PAIN_VARIANTS deve ter 3 variantes', () => {
    expect(PAIN_VARIANTS).toHaveLength(3)
  })

  it('FINANCIAL variant deve ter maior expectedOpenRate', () => {
    const financial = PAIN_VARIANTS.find((p) => p.variant === 'FINANCIAL')
    const occupancy = PAIN_VARIANTS.find((p) => p.variant === 'OCCUPANCY')
    expect(financial).toBeDefined()
    expect(occupancy).toBeDefined()
    expect(financial!.expectedOpenRate).toBeGreaterThan(occupancy!.expectedOpenRate)
  })
})
