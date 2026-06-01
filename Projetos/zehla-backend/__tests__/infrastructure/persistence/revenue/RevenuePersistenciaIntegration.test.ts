import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { getBasePrisma } from '../../../../src/lib/prisma'
import { PrismaTarifaRepository } from '../../../../src/infrastructure/persistence/revenue/PrismaTarifaRepository'
import { PrismaOcupacaoRepository } from '../../../../src/infrastructure/persistence/revenue/PrismaOcupacaoRepository'
import { PrismaSazonalidadeRepository } from '../../../../src/infrastructure/persistence/revenue/PrismaSazonalidadeRepository'
import { PrismaForecastRepository } from '../../../../src/infrastructure/persistence/revenue/PrismaForecastRepository'
import { Money } from '../../../../src/domain/comercial/value-objects/Money'
import { BreakEvenPoint } from '../../../../src/domain/revenue/value-objects/BreakEvenPoint'

function money(centavos: number) {
  const r = Money.criar(centavos)
  if (r.isFail) throw new Error(`Failed to create money: ${r.error.message}`)
  return r.value
}

function breakEven(centavos: number, tipoCusto = 'operacional') {
  const r = BreakEvenPoint.criar(money(centavos), tipoCusto)
  if (r.isFail) throw new Error(`Failed to create break-even: ${r.error.message}`)
  return r.value
}

describe('Revenue Bounded Context — Persistência Real & RLS & Fail-Fast (Prisma)', () => {
  const prisma = getBasePrisma()

  const tarifaRepo = new PrismaTarifaRepository(prisma)
  const ocupacaoRepo = new PrismaOcupacaoRepository(prisma)
  const sazRepo = new PrismaSazonalidadeRepository(prisma)
  const forecastRepo = new PrismaForecastRepository(prisma)

  const propriedadeId = 'pousada_canasvieiras_rv'
  const propriedadeOutro = 'pousada_outra_rv_999'

  beforeAll(async () => {
    await prisma.$connect()
  })

  beforeEach(async () => {
    await prisma.revenueRegraTarifaria.deleteMany()
    await prisma.revenueOcupacao.deleteMany()
    await prisma.revenueSazonalidade.deleteMany()
    await prisma.revenueForecast.deleteMany()
  })

  describe('1. PrismaTarifaRepository (Data Mapper, RLS, Break-Even Guard)', () => {
    it('deve criar e hidratar uma RegraTarifaria com 100% de integridade dos VOs', async () => {
      const criarResult = await tarifaRepo.criarRegra({
        propriedadeId,
        tipoQuarto: 'luxo',
        tipo: 'dinamica',
        valorDiaria: money(35000),
        breakEvenPoint: { valor: money(15000), tipoCusto: 'operacional' },
        canal: 'direto',
        dataInicio: new Date('2026-01-01'),
        dataFim: new Date('2026-12-31'),
        regraReajuste: 'percentual',
        parametrosReajuste: { percentualMax: 15, gatilhoOcupacao: 40 },
      })
      expect(criarResult.isOk).toBe(true)
      const regra = criarResult.value
      expect(regra.id).toBeDefined()
      expect(regra.tipoQuarto).toBe('luxo')
      expect(regra.valorDiaria.centavos).toBe(35000)
      expect(regra.breakEvenPoint.valor.centavos).toBe(15000)
      expect(regra.breakEvenPoint.tipoCusto).toBe('operacional')
      expect(regra.canal).toBe('direto')

      const buscarResult = await tarifaRepo.buscarPorId(regra.id, propriedadeId)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value!.id).toBe(regra.id)
      expect(buscarResult.value!.valorDiaria.centavos).toBe(35000)
    })

    it('deve aplicar RLS: buscar regra de outro tenant retorna null', async () => {
      const criarResult = await tarifaRepo.criarRegra({
        propriedadeId,
        tipoQuarto: 'standard',
        tipo: 'dinamica',
        valorDiaria: money(20000),
        breakEvenPoint: { valor: money(10000), tipoCusto: 'operacional' },
        canal: 'booking',
        dataInicio: new Date('2026-01-01'),
        dataFim: new Date('2026-12-31'),
        regraReajuste: 'percentual',
        parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 50 },
      })
      expect(criarResult.isOk).toBe(true)
      const id = criarResult.value.id

      const buscarOutro = await tarifaRepo.buscarPorId(id, propriedadeOutro)
      expect(buscarOutro.isOk).toBe(true)
      expect(buscarOutro.value).toBeNull()
    })

    it('deve listar apenas tarifas ativas na data fornecida', async () => {
      await tarifaRepo.criarRegra({
        propriedadeId, tipoQuarto: 'luxo', tipo: 'dinamica',
        valorDiaria: money(30000), breakEvenPoint: { valor: money(15000), tipoCusto: 'operacional' },
        canal: 'direto', dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-06-30'),
        regraReajuste: 'percentual', parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 40 },
      })
      await tarifaRepo.criarRegra({
        propriedadeId, tipoQuarto: 'luxo', tipo: 'dinamica',
        valorDiaria: money(35000), breakEvenPoint: { valor: money(15000), tipoCusto: 'operacional' },
        canal: 'direto', dataInicio: new Date('2026-07-01'), dataFim: new Date('2026-12-31'),
        regraReajuste: 'percentual', parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 40 },
      })

      const ativasJulho = await tarifaRepo.listarAtivas(propriedadeId, new Date('2026-07-15'))
      expect(ativasJulho.isOk).toBe(true)
      expect(ativasJulho.value.length).toBe(1)
      expect(ativasJulho.value[0].valorDiaria.centavos).toBe(35000)
    })

    it('deve falhar rápido ao hidratar break-even corrompido', async () => {
      const id = `tar_corrompida_${Date.now()}`
      await prisma.revenueRegraTarifaria.create({
        data: {
          id,
          propriedadeId,
          tipoQuarto: 'luxo',
          tipo: 'dinamica',
          valorDiaria: -1,
          breakEvenPoint: { valor: 0, tipoCusto: 'invalido' },
          canal: 'direto',
          dataInicio: new Date('2026-01-01'),
          dataFim: new Date('2026-12-31'),
          regraReajuste: 'percentual',
          parametrosReajuste: { percentualMax: 10, gatilhoOcupacao: 40 },
        },
      })
      const buscarResult = await tarifaRepo.buscarPorId(id, propriedadeId)
      expect(buscarResult.isFail).toBe(true)
    })

    it('deve atualizar valor da diária com break-even guard', async () => {
      const criarResult = await tarifaRepo.criarRegra({
        propriedadeId, tipoQuarto: 'suite', tipo: 'dinamica',
        valorDiaria: money(50000), breakEvenPoint: { valor: money(20000), tipoCusto: 'operacional' },
        canal: 'direto', dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-12-31'),
        regraReajuste: 'percentual', parametrosReajuste: { percentualMax: 15, gatilhoOcupacao: 40 },
      })
      expect(criarResult.isOk).toBe(true)
      const regraId = criarResult.value.id

      const atualizarResult = await tarifaRepo.atualizarValorDiaria(regraId, propriedadeId, money(55000), money(50000))
      expect(atualizarResult.isOk).toBe(true)
      expect(atualizarResult.value.valorDiaria.centavos).toBe(55000)

      const abaixoBE = await tarifaRepo.atualizarValorDiaria(regraId, propriedadeId, money(15000), money(50000))
      expect(abaixoBE.isFail).toBe(true)
      expect(abaixoBE.error.message).toContain('break-even')
    })
  })

  describe('2. PrismaOcupacaoRepository (Snapshot, Taxa, RLS)', () => {
    it('deve criar snapshot de ocupação e hidratar com Money VO', async () => {
      const criarResult = await ocupacaoRepo.registrarSnapshot({
        propriedadeId,
        data: new Date('2026-07-15'),
        tipo: 'realizada',
        totalQuartosDisponiveis: 100,
        totalQuartosOcupados: 75,
        totalReservasConfirmadas: 70,
        totalReservasPendentes: 5,
        receitaEstimada: money(1500000),
      })
      expect(criarResult.isOk).toBe(true)
      const ocupacao = criarResult.value
      expect(ocupacao.taxaOcupacao).toBe(75)
      expect(ocupacao.receitaEstimada.centavos).toBe(1500000)
      expect(ocupacao.tipo).toBe('realizada')

      const buscarResult = await ocupacaoRepo.buscarPorData(propriedadeId, new Date('2026-07-15'))
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value).not.toBeNull()
      expect(buscarResult.value!.taxaOcupacao).toBe(75)
    })

    it('deve aplicar RLS: buscar snapshot de outro tenant retorna null', async () => {
      await ocupacaoRepo.registrarSnapshot({
        propriedadeId, data: new Date('2026-07-15'), tipo: 'realizada',
        totalQuartosDisponiveis: 50, totalQuartosOcupados: 25,
        totalReservasConfirmadas: 25, totalReservasPendentes: 0,
        receitaEstimada: money(500000),
      })
      const buscarOutro = await ocupacaoRepo.buscarPorData(propriedadeOutro, new Date('2026-07-15'))
      expect(buscarOutro.isOk).toBe(true)
      expect(buscarOutro.value).toBeNull()
    })

    it('deve calcular média de ocupação de um período', async () => {
      for (let dia = 1; dia <= 5; dia++) {
        await ocupacaoRepo.registrarSnapshot({
          propriedadeId, data: new Date(`2026-07-${String(dia).padStart(2, '0')}`), tipo: 'realizada',
          totalQuartosDisponiveis: 100, totalQuartosOcupados: 60 + dia,
          totalReservasConfirmadas: 60 + dia, totalReservasPendentes: 0,
          receitaEstimada: money(1000000),
        })
      }
      const mediaResult = await ocupacaoRepo.mediaOcupacaoPeriodo(
        propriedadeId,
        new Date('2026-07-01'),
        new Date('2026-07-05'),
      )
      expect(mediaResult.isOk).toBe(true)
      expect(mediaResult.value.valor).toBeGreaterThan(60)
      expect(mediaResult.value.valor).toBeLessThanOrEqual(100)
    })
  })

  describe('3. PrismaSazonalidadeRepository (Sazonalidade, Feriado, Multiplicador)', () => {
    it('deve criar regra sazonal com multiplicador e hidratar corretamente', async () => {
      const criarResult = await sazRepo.criarRegraSazonal({
        propriedadeId,
        nome: 'Alta Temporada Verão',
        tipo: 'alta',
        multiplicadorPreco: 1.5,
        dataInicio: new Date('2026-12-20'),
        dataFim: new Date('2027-02-28'),
        diasMinimosEstadia: 3,
      })
      expect(criarResult.isOk).toBe(true)
      const saz = criarResult.value
      expect(saz.nome).toBe('Alta Temporada Verão')
      expect(saz.multiplicadorPreco).toBe(1.5)
      expect(saz.diasMinimosEstadia).toBe(3)

      const buscarResult = await sazRepo.buscarPorData(propriedadeId, new Date('2027-01-15'))
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value).not.toBeNull()
      expect(buscarResult.value!.multiplicadorPreco).toBe(1.5)
    })

    it('deve listar apenas sazonalidades do tenant correto (RLS)', async () => {
      await sazRepo.criarRegraSazonal({
        propriedadeId, nome: 'Réveillon', tipo: 'feriado',
        multiplicadorPreco: 2.0,
        dataInicio: new Date('2026-12-28'), dataFim: new Date('2027-01-02'),
      })
      const buscar = await sazRepo.buscarPorData(propriedadeOutro, new Date('2026-12-30'))
      expect(buscar.isOk).toBe(true)
      expect(buscar.value).toBeNull()
    })

    it('deve listar próximos feriados', async () => {
      await sazRepo.criarRegraSazonal({
        propriedadeId, nome: 'Natal', tipo: 'feriado',
        multiplicadorPreco: 2.5,
        dataInicio: new Date('2026-12-24'), dataFim: new Date('2026-12-26'),
      })
      await sazRepo.criarRegraSazonal({
        propriedadeId, nome: 'Réveillon', tipo: 'feriado',
        multiplicadorPreco: 3.0,
        dataInicio: new Date('2026-12-30'), dataFim: new Date('2027-01-02'),
      })
      const feriados = await sazRepo.listarProximosFeriados(propriedadeId, 365)
      expect(feriados.isOk).toBe(true)
      expect(feriados.value.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('4. PrismaForecastRepository (Forecast, Confiança, RLS)', () => {
    it('deve salvar forecast 7d e recuperar com arrays JSON hidratados', async () => {
      const criarResult = await forecastRepo.salvarForecast({
        propriedadeId,
        horizonte: 7,
        previsaoOcupacao: [60, 65, 70, 75, 80, 85, 90],
        previsaoReceita: [120000, 130000, 140000, 150000, 160000, 170000, 180000],
        previsaoADR: [30000, 31000, 32000, 33000, 34000, 35000, 36000],
        previsaoRevPAR: [18000, 20000, 22000, 24000, 26000, 28000, 30000],
        confiancaMedia: 0.85,
        variancia: 0.05,
        dadosHistoricoInicio: new Date('2026-01-01'),
        dadosHistoricoFim: new Date('2026-06-30'),
        assinaturaModelo: 'arima_v1_seasonal',
      })
      expect(criarResult.isOk).toBe(true)
      const fc = criarResult.value
      expect(fc.horizonte).toBe(7)
      expect(fc.previsaoOcupacao).toEqual([60, 65, 70, 75, 80, 85, 90])
      expect(fc.confiancaMedia).toBe(0.85)

      const buscarResult = await forecastRepo.buscarUltimoForecast(propriedadeId, 7)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value).not.toBeNull()
      expect(buscarResult.value!.previsaoOcupacao).toEqual([60, 65, 70, 75, 80, 85, 90])
    })

    it('deve aplicar RLS: forecast de outro tenant não é encontrado', async () => {
      await forecastRepo.salvarForecast({
        propriedadeId, horizonte: 30,
        previsaoOcupacao: Array(30).fill(70),
        previsaoReceita: Array(30).fill(100000),
        previsaoADR: Array(30).fill(25000),
        previsaoRevPAR: Array(30).fill(17500),
        confiancaMedia: 0.80, variancia: 0.10,
        dadosHistoricoInicio: new Date('2026-01-01'),
        dadosHistoricoFim: new Date('2026-06-30'),
        assinaturaModelo: 'prophet_v2',
      })
      const buscar = await forecastRepo.buscarUltimoForecast(propriedadeOutro, 30)
      expect(buscar.isOk).toBe(true)
      expect(buscar.value).toBeNull()
    })

    it('deve listar histórico limitado de forecasts', async () => {
      for (let i = 0; i < 5; i++) {
        await forecastRepo.salvarForecast({
          propriedadeId, horizonte: 7,
          previsaoOcupacao: Array(7).fill(70 + i),
          previsaoReceita: Array(7).fill(100000),
          previsaoADR: Array(7).fill(25000),
          previsaoRevPAR: Array(7).fill(17500),
          confiancaMedia: 0.85, variancia: 0.05,
          dadosHistoricoInicio: new Date('2026-01-01'),
          dadosHistoricoFim: new Date('2026-06-30'),
          assinaturaModelo: `model_v${i + 1}`,
        })
      }
      const historico = await forecastRepo.listarHistoricoForecasts(propriedadeId, 3)
      expect(historico.isOk).toBe(true)
      expect(historico.value.length).toBeLessThanOrEqual(3)
    })
  })
})
