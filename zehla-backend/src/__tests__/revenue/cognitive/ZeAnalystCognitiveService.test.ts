import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { Result } from '../../../shared/Result'
import { ZeAnalystCognitiveService } from '../../../application/revenue/cognitive/ZeAnalystCognitiveService'
import { ZeAnalystInput } from '../../../application/revenue/cognitive/ZeAnalystCognitiveTypes'
import { TarifaInMemoryRepository } from '../../../infrastructure/persistence/revenue/TarifaInMemoryRepository'
import { OcupacaoInMemoryRepository } from '../../../infrastructure/persistence/revenue/OcupacaoInMemoryRepository'
import { SazonalidadeInMemoryRepository } from '../../../infrastructure/persistence/revenue/SazonalidadeInMemoryRepository'
import { ForecastInMemoryRepository } from '../../../infrastructure/persistence/revenue/ForecastInMemoryRepository'
import { PropostaReadOnlyInMemoryRepository } from '../../../infrastructure/persistence/revenue/PropostaReadOnlyInMemoryRepository'
import { CalcularTarifaDinamicaUseCase } from '../../../application/revenue/use-cases/CalcularTarifaDinamicaUseCase'
import { ValidarViolacaoBreakEvenUseCase } from '../../../application/revenue/use-cases/ValidarViolacaoBreakEvenUseCase'
import { SugerirDescontoEstrategicoUseCase } from '../../../application/revenue/use-cases/SugerirDescontoEstrategicoUseCase'
import { GerarForecastDemandaUseCase } from '../../../application/revenue/use-cases/GerarForecastDemandaUseCase'
import { CalcularMetricasRevenueUseCase } from '../../../application/revenue/use-cases/CalcularMetricasRevenueUseCase'
import { RebalancearTarifasPorCanalUseCase } from '../../../application/revenue/use-cases/RebalancearTarifasPorCanalUseCase'
import { BreakEvenPoint } from '../../../domain/revenue/value-objects/BreakEvenPoint'

const ZCP_SECRET = 'zcp-test-secret-ze-analyst'

function money(reais: number) {
  const r = Money.deReais(reais)
  if (r.isFail) throw new Error(`Failed to create money: ${r.error.message}`)
  return r.value
}

describe('ZeAnalystCognitiveService', () => {
  let tarifaRepo: TarifaInMemoryRepository
  let ocupacaoRepo: OcupacaoInMemoryRepository
  let sazRepo: SazonalidadeInMemoryRepository
  let forecastRepo: ForecastInMemoryRepository
  let propostaRepo: PropostaReadOnlyInMemoryRepository
  let service: ZeAnalystCognitiveService
  let tarifaStandardId: string

  function makeInput(intent: ZeAnalystInput['intent'], overrides: Partial<ZeAnalystInput> = {}): ZeAnalystInput {
    return {
      intent,
      messageId: `msg-${Date.now()}-${Math.random()}`,
      propriedadeId: 'prop_seed',
      payload: {},
      ...overrides,
    }
  }

  beforeEach(async () => {
    tarifaRepo = new TarifaInMemoryRepository()
    ocupacaoRepo = new OcupacaoInMemoryRepository()
    sazRepo = new SazonalidadeInMemoryRepository()
    forecastRepo = new ForecastInMemoryRepository()
    propostaRepo = new PropostaReadOnlyInMemoryRepository()

    const tarifaResult = await tarifaRepo.criarRegra({
      propriedadeId: 'prop_seed', tipoQuarto: 'standard', tipo: 'dinamica',
      valorDiaria: money(200), breakEvenPoint: { valor: money(100), tipoCusto: 'operacional' },
      canal: 'direto', dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-12-31'),
      regraReajuste: 'percentual', parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 80 },
    })
    if (tarifaResult.isOk) tarifaStandardId = tarifaResult.value.id

    await ocupacaoRepo.registrarSnapshot({
      propriedadeId: 'prop_seed', data: new Date('2026-06-15'), tipo: 'projetada',
      totalQuartosDisponiveis: 100, totalQuartosOcupados: 85,
      totalReservasConfirmadas: 85, totalReservasPendentes: 5,
      receitaEstimada: money(60000),
    })

    const reservaRO = {
      contarReservasConfirmadasPorPeriodo: async () => Promise.resolve({ isOk: true, value: 85 } as any),
      contarReservasAtivasPorData: async () => Promise.resolve({ isOk: true, value: 85 } as any),
    }
    const pacoteRO = {
      listarPacotesAtivosPorPropriedade: async () => Promise.resolve({ isOk: true, value: [] } as any),
    }

    const calcularTarifaUC = new CalcularTarifaDinamicaUseCase(tarifaRepo, ocupacaoRepo, sazRepo)
    const validarBEUC = new ValidarViolacaoBreakEvenUseCase(tarifaRepo)
    const sugerirDescUC = new SugerirDescontoEstrategicoUseCase(ocupacaoRepo, propostaRepo)
    const gerarForecastUC = new GerarForecastDemandaUseCase(ocupacaoRepo, sazRepo, forecastRepo)
    const calcularMetricasUC = new CalcularMetricasRevenueUseCase(ocupacaoRepo)
    const rebalancearUC = new RebalancearTarifasPorCanalUseCase(tarifaRepo)

    service = new ZeAnalystCognitiveService(
      tarifaRepo, ocupacaoRepo, sazRepo, forecastRepo,
      reservaRO, pacoteRO, propostaRepo,
      calcularTarifaUC, validarBEUC, sugerirDescUC,
      gerarForecastUC, calcularMetricasUC, rebalancearUC,
      ZCP_SECRET,
    )
  })

  describe('CALCULAR_TARIFA_DINAMICA', () => {
    it('should calculate dynamic tariff for high occupancy', async () => {
      const output = await service.processIntent(makeInput('CALCULAR_TARIFA_DINAMICA', {
        payload: { tipoQuarto: 'standard', data: '2026-06-15' },
      }))
      expect(output.success).toBe(true)
      expect(output.data).toHaveProperty('valorSugerido')
      expect(output.data).toHaveProperty('deltaPercentual')
    })

    it('should block holiday tariff and handoff to Ze-Host', async () => {
      await sazRepo.criarRegraSazonal({
        propriedadeId: 'prop_seed', nome: 'Natal', tipo: 'feriado',
        multiplicadorPreco: 1.5,
        dataInicio: new Date('2026-12-24'), dataFim: new Date('2026-12-26'),
      })
      const output = await service.processIntent(makeInput('CALCULAR_TARIFA_DINAMICA', {
        payload: { tipoQuarto: 'standard', data: '2026-12-25' },
      }))
      expect(output.success).toBe(true)
      expect(output.needsEscalation).toBe(true)
      expect(output.handoffRequired).toBe(true)
      expect(output.handoffTo).toBe('ze-host')
    })

    it('should fail when tariff would violate break-even', async () => {
      await tarifaRepo.criarRegra({
        propriedadeId: 'prop_seed', tipoQuarto: 'luxo', tipo: 'dinamica',
        valorDiaria: money(105), breakEvenPoint: { valor: money(100), tipoCusto: 'operacional' },
        canal: 'direto', dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-12-31'),
        regraReajuste: 'percentual', parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 40 },
      })
      await ocupacaoRepo.registrarSnapshot({
        propriedadeId: 'prop_seed', data: new Date('2026-07-15'), tipo: 'projetada',
        totalQuartosDisponiveis: 100, totalQuartosOcupados: 20,
        totalReservasConfirmadas: 20, totalReservasPendentes: 0,
        receitaEstimada: money(10000),
      })
      const output = await service.processIntent(makeInput('CALCULAR_TARIFA_DINAMICA', {
        payload: { tipoQuarto: 'standard_be', data: '2026-07-15' },
      }))
      expect(output.success).toBe(false)
    })
  })

  describe('VALIDAR_BREAK_EVEN', () => {
    it('should accept value above break-even', async () => {
      const output = await service.processIntent(makeInput('VALIDAR_BREAK_EVEN', {
        payload: { regraTarifariaId: tarifaStandardId, valorPretendido: 150 },
      }))
      expect(output.success).toBe(true)
    })

    it('should reject value below break-even', async () => {
      const output = await service.processIntent(makeInput('VALIDAR_BREAK_EVEN', {
        payload: { regraTarifariaId: tarifaStandardId, valorPretendido: 50 },
      }))
      expect(output.success).toBe(false)
    })
  })

  describe('SUGERIR_DESCONTO_ESTRATEGICO', () => {
    it('should suggest discount for low occupancy', async () => {
      await ocupacaoRepo.registrarSnapshot({
        propriedadeId: 'prop_seed', data: new Date('2026-06-15'), tipo: 'realizada',
        totalQuartosDisponiveis: 100, totalQuartosOcupados: 25,
        totalReservasConfirmadas: 0, totalReservasPendentes: 0,
        receitaEstimada: money(15000),
      })
      const output = await service.processIntent(makeInput('SUGERIR_DESCONTO_ESTRATEGICO', {
        payload: { valorOriginal: 500 },
      }))
      expect(output.success).toBe(true)
      expect(output.data).toHaveProperty('descontoPercentual')
    })
  })

  describe('GERAR_FORECAST', () => {
    it('should generate 7-day forecast', async () => {
      for (let i = 1; i <= 10; i++) {
        await ocupacaoRepo.registrarSnapshot({
          propriedadeId: 'prop_seed', data: new Date(2026, 4, i), tipo: 'realizada',
          totalQuartosDisponiveis: 100, totalQuartosOcupados: 70,
          totalReservasConfirmadas: 0, totalReservasPendentes: 0,
          receitaEstimada: money(45000),
        })
      }
      const output = await service.processIntent(makeInput('GERAR_FORECAST', {
        payload: { horizonte: 7 },
      }))
      expect(output.success).toBe(true)
      expect(output.data).toHaveProperty('forecastId')
    })
  })

  describe('CALCULAR_METRICAS_REVENUE & CONSULTAR_METRICAS', () => {
    it('should calculate revenue metrics via CALCULAR_METRICAS_REVENUE intent', async () => {
      for (let i = 1; i <= 5; i++) {
        await ocupacaoRepo.registrarSnapshot({
          propriedadeId: 'prop_seed', data: new Date(`2026-06-${10 + i}`), tipo: 'realizada',
          totalQuartosDisponiveis: 100, totalQuartosOcupados: 75,
          totalReservasConfirmadas: 0, totalReservasPendentes: 0,
          receitaEstimada: money(50000),
        })
      }
      const output = await service.processIntent(makeInput('CALCULAR_METRICAS_REVENUE', {
        payload: {
          dataInicio: '2026-06-10', dataFim: '2026-06-20',
          custoOperacionalPorQuarto: 200,
        },
      }))
      expect(output.success).toBe(true)
      expect(output.data).toHaveProperty('adr')
      expect(output.data).toHaveProperty('revpar')
    })

    it('should calculate revenue metrics via CONSULTAR_METRICAS intent and delegate calculations to use case', async () => {
      const mockResult = Result.ok({
        adr: 12000,
        revpar: 9000,
        goppar: 7000,
        taxaOcupacaoMedia: 75,
        breakEvenRatio: 60
      })
      
      const spyExecute = vi.spyOn((service as any).calcularMetricasUseCase, 'execute').mockImplementation(async () => mockResult)

      const output = await service.processIntent(makeInput('CONSULTAR_METRICAS', {
        payload: {
          dataInicio: '2026-06-10', dataFim: '2026-06-20',
          custoOperacionalPorQuarto: 200,
        },
      }))

      expect(output.success).toBe(true)
      expect(spyExecute).toHaveBeenCalledTimes(1)
      expect(spyExecute).toHaveBeenCalledWith({
        propriedadeId: 'prop_seed',
        dataInicio: new Date('2026-06-10'),
        dataFim: new Date('2026-06-20'),
        custoOperacionalPorQuarto: 20000
      })
      expect(output.responseText).toContain('ADR 120.00 | RevPAR 90.00 | GOPPAR 70.00 | Ocupação 75% | Break-even ratio 60%.')
      
      spyExecute.mockRestore()
    })
  })

  describe('REBALANCEAR_TARIFAS_POR_CANAL', () => {
    it('should rebalance tariffs by elasticity', async () => {
      const output = await service.processIntent(makeInput('REBALANCEAR_TARIFAS_POR_CANAL', {
        payload: {
          data: '2026-06-15',
          elasticidadePorCanal: { direto: -0.3 },
        },
      }))
      expect(output.success).toBe(true)
      expect(output.data).toHaveProperty('ajustes')
    })
  })

  describe('ZCP Handoff', () => {
    it('should create valid ZCP handoff to Ze-Host', () => {
      const handoff = service.requestHandoff({
        destino: 'ze-host',
        contexto: 'Tarifa de feriado requer aprovação humana.',
        motivo: 'Feriado nacional detectado.',
        payload: { regraId: 'tar_001', tipoQuarto: 'standard' },
      })
      expect(handoff.packageId).toBeTruthy()
      expect(handoff.origem).toBe('ze-analyst')
      expect(handoff.destino).toBe('ze-host')
      expect(handoff.zcpSignature).toBeTruthy()
    })
  })

  describe('Unknown intent', () => {
    it('should reject unknown intent', async () => {
      const output = await service.processIntent({
        intent: 'FAKE_INTENT' as any,
        messageId: 'msg-test',
        propriedadeId: 'prop_seed',
        payload: {},
      })
      expect(output.success).toBe(false)
    })
  })
})
