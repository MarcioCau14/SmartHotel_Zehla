import { describe, it, expect, beforeEach } from 'vitest'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { BreakEvenPoint } from '../../../domain/revenue/value-objects/BreakEvenPoint'
import { TarifaInMemoryRepository } from '../../../infrastructure/persistence/revenue/TarifaInMemoryRepository'
import { OcupacaoInMemoryRepository } from '../../../infrastructure/persistence/revenue/OcupacaoInMemoryRepository'
import { SazonalidadeInMemoryRepository } from '../../../infrastructure/persistence/revenue/SazonalidadeInMemoryRepository'
import { ForecastInMemoryRepository } from '../../../infrastructure/persistence/revenue/ForecastInMemoryRepository'
import { CalcularTarifaDinamicaUseCase } from '../../../application/revenue/use-cases/CalcularTarifaDinamicaUseCase'
import { ValidarViolacaoBreakEvenUseCase } from '../../../application/revenue/use-cases/ValidarViolacaoBreakEvenUseCase'
import { SugerirDescontoEstrategicoUseCase } from '../../../application/revenue/use-cases/SugerirDescontoEstrategicoUseCase'
import { GerarForecastDemandaUseCase } from '../../../application/revenue/use-cases/GerarForecastDemandaUseCase'
import { CalcularMetricasRevenueUseCase } from '../../../application/revenue/use-cases/CalcularMetricasRevenueUseCase'
import { RebalancearTarifasPorCanalUseCase } from '../../../application/revenue/use-cases/RebalancearTarifasPorCanalUseCase'
import { PropostaReadOnlyInMemoryRepository } from '../../../infrastructure/persistence/revenue/PropostaReadOnlyInMemoryRepository'

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

describe('CalcularTarifaDinamicaUseCase', () => {
  let tarifaRepo: TarifaInMemoryRepository
  let ocupacaoRepo: OcupacaoInMemoryRepository
  let sazRepo: SazonalidadeInMemoryRepository
  let useCase: CalcularTarifaDinamicaUseCase

  beforeEach(async () => {
    tarifaRepo = new TarifaInMemoryRepository()
    ocupacaoRepo = new OcupacaoInMemoryRepository()
    sazRepo = new SazonalidadeInMemoryRepository()
    useCase = new CalcularTarifaDinamicaUseCase(tarifaRepo, ocupacaoRepo, sazRepo)

    await tarifaRepo.criarRegra({
      propriedadeId: 'prop_seed', tipoQuarto: 'standard', tipo: 'dinamica',
      valorDiaria: money(200), breakEvenPoint: { valor: money(100), tipoCusto: 'operacional' },
      canal: 'direto', dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-12-31'),
      regraReajuste: 'percentual', parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 80 },
    })

    await ocupacaoRepo.registrarSnapshot({
      propriedadeId: 'prop_seed', data: new Date('2026-06-15'), tipo: 'projetada',
      totalQuartosDisponiveis: 100, totalQuartosOcupados: 85,
      totalReservasConfirmadas: 85, totalReservasPendentes: 5,
      receitaEstimada: money(60000),
    })
  })

  it('should suggest increase for high occupancy (≥80%)', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', tipoQuarto: 'standard',
      data: new Date('2026-06-15'),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.valorSugerido).toBeGreaterThan(result.value.valorAtual)
      expect(result.value.deltaPercentual).toBeGreaterThan(0)
      expect(result.value.justificativa).toContain('80%')
    }
  })

  it('should suggest reduction for low occupancy (≤40%)', async () => {
    await ocupacaoRepo.registrarSnapshot({
      propriedadeId: 'prop_seed', data: new Date('2026-07-15'), tipo: 'projetada',
      totalQuartosDisponiveis: 100, totalQuartosOcupados: 30,
      totalReservasConfirmadas: 30, totalReservasPendentes: 5,
      receitaEstimada: money(20000),
    })
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', tipoQuarto: 'standard',
      data: new Date('2026-07-15'),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.valorSugerido).toBeLessThan(result.value.valorAtual)
      expect(result.value.justificativa).toContain('40%')
    }
  })

  it('should not violate break-even on reduction', async () => {
    await tarifaRepo.criarRegra({
      propriedadeId: 'prop_seed', tipoQuarto: 'luxo', tipo: 'dinamica',
      valorDiaria: money(105), breakEvenPoint: { valor: money(100), tipoCusto: 'operacional' },
      canal: 'direto', dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-12-31'),
      regraReajuste: 'percentual', parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 40 },
    })
    await ocupacaoRepo.registrarSnapshot({
      propriedadeId: 'prop_seed', data: new Date('2026-07-15'), tipo: 'projetada',
      totalQuartosDisponiveis: 100, totalQuartosOcupados: 25,
      totalReservasConfirmadas: 25, totalReservasPendentes: 3,
      receitaEstimada: money(15000),
    })
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', tipoQuarto: 'luxo',
      data: new Date('2026-07-15'),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.violaBreakEven).toBe(true)
    }
  })

  it('should block holiday tariffs (requires Ze-Host)', async () => {
    await sazRepo.criarRegraSazonal({
      propriedadeId: 'prop_seed', nome: 'Natal', tipo: 'feriado',
      multiplicadorPreco: 1.5,
      dataInicio: new Date('2026-12-24'), dataFim: new Date('2026-12-26'),
    })
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', tipoQuarto: 'standard',
      data: new Date('2026-12-25'),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.bloqueadoPorFeriado).toBe(true)
    }
  })

  it('should block promocional tariffs', async () => {
    await tarifaRepo.criarRegra({
      propriedadeId: 'prop_seed', tipoQuarto: 'luxo', tipo: 'promocional',
      valorDiaria: money(500), breakEvenPoint: { valor: money(100), tipoCusto: 'operacional' },
      canal: 'direto', dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-12-31'),
      regraReajuste: 'percentual', parametrosReajuste: { percentualMax: 0, gatilhoOcupacao: 0 },
    })
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', tipoQuarto: 'luxo',
      data: new Date('2026-06-15'),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.bloqueadoPorPromocional).toBe(true)
    }
  })

  it('should keep stable for moderate occupancy', async () => {
    await ocupacaoRepo.registrarSnapshot({
      propriedadeId: 'prop_seed', data: new Date('2026-08-15'), tipo: 'projetada',
      totalQuartosDisponiveis: 100, totalQuartosOcupados: 55,
      totalReservasConfirmadas: 55, totalReservasPendentes: 5,
      receitaEstimada: money(40000),
    })
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', tipoQuarto: 'standard',
      data: new Date('2026-08-15'),
    })
    expect(result.isOk).toBe(true)
  })
})

describe('ValidarViolacaoBreakEvenUseCase', () => {
  let tarifaRepo: TarifaInMemoryRepository
  let useCase: ValidarViolacaoBreakEvenUseCase
  let regraId: string

  beforeEach(async () => {
    tarifaRepo = new TarifaInMemoryRepository()
    useCase = new ValidarViolacaoBreakEvenUseCase(tarifaRepo)

    const r = await tarifaRepo.criarRegra({
      propriedadeId: 'prop_seed', tipoQuarto: 'standard', tipo: 'dinamica',
      valorDiaria: money(200), breakEvenPoint: { valor: money(100), tipoCusto: 'operacional' },
      canal: 'direto', dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-12-31'),
      regraReajuste: 'percentual', parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 80 },
    })
    if (r.isOk) regraId = r.value.id
  })

  it('should validate value above break-even', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', regraTarifariaId: regraId,
      valorPretendido: money(150),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) expect(result.value.valido).toBe(true)
  })

  it('should detect break-even violation', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', regraTarifariaId: regraId,
      valorPretendido: money(50),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.valido).toBe(false)
      expect(result.value.breakEvenAtingido).toBe(true)
    }
  })

  it('should flag when break-even is near (≤10% margin)', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', regraTarifariaId: regraId,
      valorPretendido: money(105),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.valido).toBe(true)
      expect(result.value.breakEvenAtingido).toBe(true)
    }
  })
})

describe('SugerirDescontoEstrategicoUseCase', () => {
  let ocupacaoRepo: OcupacaoInMemoryRepository
  let propostaRepo: PropostaReadOnlyInMemoryRepository
  let useCase: SugerirDescontoEstrategicoUseCase

  beforeEach(async () => {
    ocupacaoRepo = new OcupacaoInMemoryRepository()
    propostaRepo = new PropostaReadOnlyInMemoryRepository()
    useCase = new SugerirDescontoEstrategicoUseCase(ocupacaoRepo, propostaRepo)
  })

  function hojeOu(offset: number): Date {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return d
  }

  it('should suggest 20% discount when occupancy < 30%', async () => {
    await ocupacaoRepo.registrarSnapshot({
      propriedadeId: 'prop_seed', data: hojeOu(-1), tipo: 'realizada',
      totalQuartosDisponiveis: 100, totalQuartosOcupados: 25,
      totalReservasConfirmadas: 0, totalReservasPendentes: 0,
      receitaEstimada: money(15000),
    })
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', valorOriginal: 50000,
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.descontoPercentual).toBe(20)
    }
  })

  it('should suggest 10% discount when occupancy < 60%', async () => {
    await ocupacaoRepo.registrarSnapshot({
      propriedadeId: 'prop_seed', data: hojeOu(-2), tipo: 'realizada',
      totalQuartosDisponiveis: 100, totalQuartosOcupados: 50,
      totalReservasConfirmadas: 0, totalReservasPendentes: 0,
      receitaEstimada: money(30000),
    })
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', valorOriginal: 50000,
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.descontoPercentual).toBe(10)
    }
  })

  it('should suggest no discount when occupancy ≥ 60%', async () => {
    await ocupacaoRepo.registrarSnapshot({
      propriedadeId: 'prop_seed', data: hojeOu(-3), tipo: 'realizada',
      totalQuartosDisponiveis: 100, totalQuartosOcupados: 70,
      totalReservasConfirmadas: 0, totalReservasPendentes: 0,
      receitaEstimada: money(50000),
    })
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', valorOriginal: 50000,
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.descontoPercentual).toBe(0)
    }
  })
})

describe('CalcularMetricasRevenueUseCase', () => {
  let ocupacaoRepo: OcupacaoInMemoryRepository
  let useCase: CalcularMetricasRevenueUseCase

  beforeEach(async () => {
    ocupacaoRepo = new OcupacaoInMemoryRepository()
    useCase = new CalcularMetricasRevenueUseCase(ocupacaoRepo)

    for (let i = 1; i <= 5; i++) {
      await ocupacaoRepo.registrarSnapshot({
        propriedadeId: 'prop_seed',
        data: new Date(`2026-06-${10 + i}`),
        tipo: 'realizada',
        totalQuartosDisponiveis: 100,
        totalQuartosOcupados: 70 + i,
        totalReservasConfirmadas: 70 + i,
        totalReservasPendentes: 0,
        receitaEstimada: money(50000 + i * 1000),
      })
    }
  })

  it('should calculate ADR/RevPAR/GOPPAR', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed',
      dataInicio: new Date('2026-06-10'),
      dataFim: new Date('2026-06-20'),
      custoOperacionalPorQuarto: 20000,
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.adr).toBeGreaterThan(0)
      expect(result.value.revpar).toBeGreaterThan(0)
      expect(result.value.taxaOcupacaoMedia).toBeGreaterThan(0)
    }
  })
})

describe('GerarForecastDemandaUseCase', () => {
  let ocupacaoRepo: OcupacaoInMemoryRepository
  let sazRepo: SazonalidadeInMemoryRepository
  let forecastRepo: ForecastInMemoryRepository
  let useCase: GerarForecastDemandaUseCase

  beforeEach(async () => {
    ocupacaoRepo = new OcupacaoInMemoryRepository()
    sazRepo = new SazonalidadeInMemoryRepository()
    forecastRepo = new ForecastInMemoryRepository()
    useCase = new GerarForecastDemandaUseCase(ocupacaoRepo, sazRepo, forecastRepo)

    for (let i = 1; i <= 30; i++) {
      await ocupacaoRepo.registrarSnapshot({
        propriedadeId: 'prop_seed',
        data: new Date(2026, 4, i),
        tipo: 'realizada',
        totalQuartosDisponiveis: 100,
        totalQuartosOcupados: 60 + Math.floor(Math.random() * 20),
        totalReservasConfirmadas: 0,
        totalReservasPendentes: 0,
        receitaEstimada: money(40000 + Math.floor(Math.random() * 10000)),
      })
    }
  })

  it('should generate 7-day forecast', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', horizonte: 7,
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.horizonte).toBe(7)
      expect(result.value.previsaoOcupacao.length).toBe(7)
      expect(result.value.confiancaMedia).toBeLessThanOrEqual(0.95)
    }
  })

  it('should generate 30-day forecast with lower confidence', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', horizonte: 30,
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.horizonte).toBe(30)
      expect(result.value.previsaoOcupacao.length).toBe(30)
      expect(result.value.confiancaMedia).toBeLessThanOrEqual(0.85)
    }
  })
})

describe('RebalancearTarifasPorCanalUseCase', () => {
  let tarifaRepo: TarifaInMemoryRepository
  let useCase: RebalancearTarifasPorCanalUseCase

  beforeEach(async () => {
    tarifaRepo = new TarifaInMemoryRepository()
    useCase = new RebalancearTarifasPorCanalUseCase(tarifaRepo)

    for (const canal of ['direto', 'booking', 'airbnb', 'expedia']) {
      await tarifaRepo.criarRegra({
        propriedadeId: 'prop_seed', tipoQuarto: 'standard', tipo: 'dinamica',
        valorDiaria: money(200), breakEvenPoint: { valor: money(100), tipoCusto: 'operacional' },
        canal, dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-12-31'),
        regraReajuste: 'percentual', parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 80 },
      })
    }
  })

  it('should suggest increase for inelastic channels', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', data: new Date('2026-06-15'),
      elasticidadePorCanal: { direto: -0.3, booking: -0.8, airbnb: -1.5, expedia: -2.0 },
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      const direto = result.value.find(a => a.canal === 'direto')
      expect(direto).toBeDefined()
      if (direto) {
        expect(direto.valorSugerido).toBeGreaterThan(direto.valorAtual)
      }
    }
  })

  it('should suggest reduction for elastic channels', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_seed', data: new Date('2026-06-15'),
      elasticidadePorCanal: { direto: -2.5, booking: -1.8, airbnb: -1.5, expedia: -0.3 },
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      const direto = result.value.find(a => a.canal === 'direto')
      expect(direto).toBeDefined()
      if (direto) {
        expect(direto.valorSugerido).toBeLessThan(direto.valorAtual)
      }
    }
  })
})
