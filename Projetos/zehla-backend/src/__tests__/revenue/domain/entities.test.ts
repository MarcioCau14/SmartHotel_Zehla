import { describe, it, expect } from 'vitest'
import { RegraTarifaria } from '../../../domain/revenue/entities/RegraTarifaria'
import { Ocupacao } from '../../../domain/revenue/entities/Ocupacao'
import { Sazonalidade } from '../../../domain/revenue/entities/Sazonalidade'
import { Forecast } from '../../../domain/revenue/entities/Forecast'
import { BreakEvenPoint } from '../../../domain/revenue/value-objects/BreakEvenPoint'
import { Money } from '../../../domain/comercial/value-objects/Money'

function money(reais: number) {
  const r = Money.deReais(reais)
  if (r.isFail) throw new Error(`Failed to create money: ${r.error.message}`)
  return r.value
}

function be(reais: number) {
  const r = BreakEvenPoint.criar(money(reais), 'operacional')
  if (r.isFail) throw new Error(`Failed to create break-even: ${r.error.message}`)
  return r.value
}

function makeTarifaProps(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tar_001',
    propriedadeId: 'prop_seed',
    tipoQuarto: 'standard',
    tipo: 'dinamica',
    valorDiaria: money(200),
    breakEvenPoint: be(100),
    canal: 'direto',
    dataInicio: new Date('2026-01-01'),
    dataFim: new Date('2026-12-31'),
    regraReajuste: 'percentual',
    parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 80 },
    ...overrides,
  }
}

describe('RegraTarifaria', () => {
  it('should create valid regra tarifaria', () => {
    const r = RegraTarifaria.create(makeTarifaProps())
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      expect(r.value.tipo).toBe('dinamica')
      expect(r.value.canal).toBe('direto')
    }
  })

  it('should enforce break-even on create (R1)', () => {
    const r = RegraTarifaria.create(makeTarifaProps({
      valorDiaria: money(50),
      breakEvenPoint: be(100),
    }))
    expect(r.isFail).toBe(true)
    expect(r.isFail ? r.error.message : '').toContain('break-even')
  })

  it('should enforce delta max 20% on create with valorAnterior (R2)', () => {
    const r = RegraTarifaria.create(makeTarifaProps({
      valorDiaria: money(200),
      valorAnterior: money(100),
    }))
    expect(r.isFail).toBe(true)
    expect(r.isFail ? r.error.message : '').toContain('20%')
  })

  it('should allow delta within 20%', () => {
    const r = RegraTarifaria.create(makeTarifaProps({
      valorDiaria: money(110),
      valorAnterior: money(100),
    }))
    expect(r.isOk).toBe(true)
  })

  it('should enforce holiday anchoring (R5) — must be promocional', () => {
    const natalInicio = new Date('2026-12-20')
    const natalFim = new Date('2026-12-26')
    const r = RegraTarifaria.create(makeTarifaProps({
      tipo: 'dinamica',
      dataInicio: natalInicio,
      dataFim: natalFim,
    }))
    expect(r.isFail).toBe(true)
    expect(r.isFail ? r.error.message : '').toContain('feriado')
  })

  it('should allow promocional during holiday', () => {
    const natalInicio = new Date('2026-12-20')
    const natalFim = new Date('2026-12-26')
    const r = RegraTarifaria.create(makeTarifaProps({
      tipo: 'promocional',
      dataInicio: natalInicio,
      dataFim: natalFim,
      parametrosReajuste: { percentualMax: 0, gatilhoOcupacao: 0 },
    }))
    expect(r.isOk).toBe(true)
  })

  it('should reject invalid tipoQuarto', () => {
    const r = RegraTarifaria.create(makeTarifaProps({ tipoQuarto: 'inexistente' }))
    expect(r.isFail).toBe(true)
  })

  it('should reject invalid canal', () => {
    const r = RegraTarifaria.create(makeTarifaProps({ canal: 'whatsapp' }))
    expect(r.isFail).toBe(true)
  })

  it('should emit TarifaAtualizadaEvent on create', () => {
    const r = RegraTarifaria.create(makeTarifaProps())
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      expect(r.value.eventos.length).toBeGreaterThanOrEqual(1)
      expect(r.value.eventos[0].type).toBe('TarifaAtualizadaEvent')
    }
  })

  describe('atualizarValorDiaria', () => {
    it('should block update below break-even (R1)', () => {
      const r = RegraTarifaria.create(makeTarifaProps())
      expect(r.isOk).toBe(true)
      if (r.isOk) {
        const updated = r.value.atualizarValorDiaria(money(50))
        expect(updated.isFail).toBe(true)
        expect(updated.isFail ? updated.error.message : '').toContain('break-even')
      }
    })

    it('should block update with delta > 20% (R2)', () => {
      const r = RegraTarifaria.create(makeTarifaProps({
        valorDiaria: money(200),
      }))
      expect(r.isOk).toBe(true)
      if (r.isOk) {
        const updated = r.value.atualizarValorDiaria(money(300))
        expect(updated.isFail).toBe(true)
        expect(updated.isFail ? updated.error.message : '').toContain('20%')
      }
    })

    it('should block update for promocional tariff', () => {
      const r = RegraTarifaria.create(makeTarifaProps({
        tipo: 'promocional',
        parametrosReajuste: { percentualMax: 0, gatilhoOcupacao: 0 },
      }))
      expect(r.isOk).toBe(true)
      if (r.isOk) {
        const updated = r.value.atualizarValorDiaria(money(250))
        expect(updated.isFail).toBe(true)
        expect(updated.isFail ? updated.error.message : '').toContain('promocional')
      }
    })

    it('should allow valid update within limits', () => {
      const r = RegraTarifaria.create(makeTarifaProps({
        valorDiaria: money(200),
      }))
      expect(r.isOk).toBe(true)
      if (r.isOk) {
        const updated = r.value.atualizarValorDiaria(money(220))
        expect(updated.isOk).toBe(true)
        if (updated.isOk) {
          expect(updated.value.valorDiaria.centavos).toBe(22000)
        }
      }
    })

    it('should emit BreakEvenAtingidoEvent when near break-even', () => {
      const r = RegraTarifaria.create(makeTarifaProps({
        valorDiaria: money(200),
        breakEvenPoint: be(190),
      }))
      expect(r.isOk).toBe(true)
      if (r.isOk) {
        const updated = r.value.atualizarValorDiaria(money(200))
        expect(updated.isOk).toBe(true)
        if (updated.isOk) {
          const breakEvenEvents = updated.value.eventos.filter(e => e.type === 'BreakEvenAtingidoEvent')
          expect(breakEvenEvents.length).toBe(1)
        }
      }
    })
  })

  describe('validarParidadeTarifaria (R6)', () => {
    it('should pass parity for direct channel within 10%', () => {
      const r = RegraTarifaria.create(makeTarifaProps({
        valorDiaria: money(200),
        canal: 'direto',
      }))
      expect(r.isOk).toBe(true)
      if (r.isOk) {
        const result = r.value.validarParidadeTarifaria(money(190))
        expect(result.isOk).toBe(true)
      }
    })

    it('should reject parity for direct channel >10% cheaper than OTA', () => {
      const r = RegraTarifaria.create(makeTarifaProps({
        valorDiaria: money(150),
        canal: 'direto',
      }))
      expect(r.isOk).toBe(true)
      if (r.isOk) {
        const result = r.value.validarParidadeTarifaria(money(200))
        expect(result.isFail).toBe(true)
        expect(result.isFail ? result.error.message : '').toContain('paridade')
      }
    })

    it('should skip parity check for non-direct channels', () => {
      const r = RegraTarifaria.create(makeTarifaProps({
        canal: 'booking',
      }))
      expect(r.isOk).toBe(true)
      if (r.isOk) {
        const result = r.value.validarParidadeTarifaria(money(100))
        expect(result.isOk).toBe(true)
      }
    })
  })
})

describe('Ocupacao', () => {
  function makeOcupacaoProps(overrides: Record<string, unknown> = {}) {
    return {
      id: 'ocup_001',
      propriedadeId: 'prop_seed',
      data: new Date('2026-06-15'),
      tipo: 'realizada',
      totalQuartosDisponiveis: 100,
      totalQuartosOcupados: 75,
      totalReservasConfirmadas: 80,
      totalReservasPendentes: 5,
      receitaEstimada: money(50000),
      ...overrides,
    }
  }

  it('should create valid ocupacao', () => {
    const o = Ocupacao.create(makeOcupacaoProps())
    expect(o.isOk).toBe(true)
    if (o.isOk) {
      expect(o.value.taxaOcupacao).toBe(75)
    }
  })

  it('should enforce max occupancy (O1)', () => {
    const o = Ocupacao.create(makeOcupacaoProps({
      totalQuartosOcupados: 150,
    }))
    expect(o.isFail).toBe(true)
    expect(o.isFail ? o.error.message : '').toContain('exceder')
  })

  it('should reject negative ocupados', () => {
    const o = Ocupacao.create(makeOcupacaoProps({
      totalQuartosOcupados: -1,
    }))
    expect(o.isFail).toBe(true)
  })

  it('should reject invalid tipo', () => {
    const o = Ocupacao.create(makeOcupacaoProps({ tipo: 'futura' }))
    expect(o.isFail).toBe(true)
  })
})

describe('Sazonalidade', () => {
  function makeSazProps(overrides: Record<string, unknown> = {}) {
    return {
      id: 'saz_001',
      propriedadeId: 'prop_seed',
      nome: 'Alta Temporada Julho',
      tipo: 'alta',
      multiplicadorPreco: 1.5,
      dataInicio: new Date('2026-07-01'),
      dataFim: new Date('2026-07-31'),
      ...overrides,
    }
  }

  it('should create valid sazonalidade', () => {
    const s = Sazonalidade.create(makeSazProps())
    expect(s.isOk).toBe(true)
  })

  it('should enforce minimum multiplier (S2)', () => {
    const s = Sazonalidade.create(makeSazProps({ multiplicadorPreco: 0.5 }))
    expect(s.isFail).toBe(true)
    expect(s.isFail ? s.error.message : '').toContain('0.7')
  })

  it('should enforce holiday exclusivity (S3)', () => {
    const s = Sazonalidade.create(makeSazProps({
      tipo: 'alta',
      nome: 'Natal como alta',
      dataInicio: new Date('2026-12-24'),
      dataFim: new Date('2026-12-26'),
    }))
    expect(s.isFail).toBe(true)
    expect(s.isFail ? s.error.message : '').toContain('feriado')
  })

  it('should allow feriado type during holiday period', () => {
    const s = Sazonalidade.create(makeSazProps({
      tipo: 'feriado',
      nome: 'Natal',
      dataInicio: new Date('2026-12-24'),
      dataFim: new Date('2026-12-26'),
    }))
    expect(s.isOk).toBe(true)
  })
})

describe('Forecast', () => {
  function makeForecastProps(overrides: Record<string, unknown> = {}) {
    return {
      id: 'fc_001',
      propriedadeId: 'prop_seed',
      horizonte: 7,
      previsaoOcupacao: [70, 72, 68, 75, 80, 85, 82],
      previsaoReceita: [50000, 51000, 49000, 53000, 56000, 60000, 58000],
      previsaoADR: [714, 708, 721, 707, 700, 706, 707],
      previsaoRevPAR: [500, 510, 490, 530, 560, 600, 580],
      confiancaMedia: 0.9,
      variancia: 5.2,
      dadosHistoricoInicio: new Date('2026-03-01'),
      dadosHistoricoFim: new Date('2026-06-01'),
      assinaturaModelo: 'ze-analyst-v1-7d',
      ...overrides,
    }
  }

  it('should create valid 7d forecast', () => {
    const f = Forecast.create(makeForecastProps())
    expect(f.isOk).toBe(true)
  })

  it('should enforce valid horizonte (F1)', () => {
    const f = Forecast.create(makeForecastProps({ horizonte: 15 }))
    expect(f.isFail).toBe(true)
    expect(f.isFail ? f.error.message : '').toContain('7, 30 ou 90')
  })

  it('should enforce array length matches horizonte', () => {
    const f = Forecast.create(makeForecastProps({
      previsaoOcupacao: [70, 72, 68],
    }))
    expect(f.isFail).toBe(true)
  })

  it('should enforce confianca limits for 7d (F2) — max 0.95', () => {
    const f = Forecast.create(makeForecastProps({ confiancaMedia: 0.99 }))
    expect(f.isFail).toBe(true)
    expect(f.isFail ? f.error.message : '').toContain('0.95')
  })

  it('should enforce confianca limits for 30d (F2) — max 0.85', () => {
    const arr30 = Array(30).fill(70)
    const arr30rec = Array(30).fill(50000)
    const arr30adr = Array(30).fill(700)
    const arr30rev = Array(30).fill(500)
    const f = Forecast.create(makeForecastProps({
      horizonte: 30, confiancaMedia: 0.90,
      previsaoOcupacao: arr30, previsaoReceita: arr30rec,
      previsaoADR: arr30adr, previsaoRevPAR: arr30rev,
    }))
    expect(f.isFail).toBe(true)
    expect(f.isFail ? f.error.message : '').toContain('0.85')
  })

  it('should enforce confianca limits for 90d (F2) — max 0.70', () => {
    const arr90 = Array(90).fill(70)
    const arr90rec = Array(90).fill(50000)
    const arr90adr = Array(90).fill(700)
    const arr90rev = Array(90).fill(500)
    const f = Forecast.create(makeForecastProps({
      horizonte: 90, confiancaMedia: 0.80,
      previsaoOcupacao: arr90, previsaoReceita: arr90rec,
      previsaoADR: arr90adr, previsaoRevPAR: arr90rev,
    }))
    expect(f.isFail).toBe(true)
    expect(f.isFail ? f.error.message : '').toContain('0.7')
  })

  it('should enforce ocupacao between 0 and 100', () => {
    const f = Forecast.create(makeForecastProps({
      previsaoOcupacao: [70, 72, 68, 75, 80, 85, 150],
    }))
    expect(f.isFail).toBe(true)
  })

  it('should enforce receita non-negative', () => {
    const f = Forecast.create(makeForecastProps({
      previsaoReceita: [50000, 51000, 49000, 53000, -1, 60000, 58000],
    }))
    expect(f.isFail).toBe(true)
  })

  it('should emit ForecastGeradoEvent on create', () => {
    const f = Forecast.create(makeForecastProps())
    expect(f.isOk).toBe(true)
    if (f.isOk) {
      expect(f.value.eventos.length).toBe(1)
      expect(f.value.eventos[0].type).toBe('ForecastGeradoEvent')
    }
  })

  it('should calculate receitaProjetadaTotal', () => {
    const f = Forecast.create(makeForecastProps())
    expect(f.isOk).toBe(true)
    if (f.isOk) {
      expect(f.value.receitaProjetadaTotal.centavos).toBeGreaterThan(0)
    }
  })
})
