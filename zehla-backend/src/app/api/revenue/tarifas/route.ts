import { NextRequest, NextResponse } from 'next/server'
import { getBasePrisma } from '../../../../lib/prisma'
import { authenticateRequest } from '../../../../infrastructure/http/auth/jwtAuth'
import { PrismaTarifaRepository } from '../../../../infrastructure/persistence/revenue/PrismaTarifaRepository'
import { PrismaOcupacaoRepository } from '../../../../infrastructure/persistence/revenue/PrismaOcupacaoRepository'
import { PrismaSazonalidadeRepository } from '../../../../infrastructure/persistence/revenue/PrismaSazonalidadeRepository'
import { PrismaForecastRepository } from '../../../../infrastructure/persistence/revenue/PrismaForecastRepository'
import { PrismaPropostaRepository } from '../../../../infrastructure/persistence/comercial/PrismaPropostaRepository'
import { PrismaPacoteRepository } from '../../../../infrastructure/persistence/comercial/PrismaPacoteRepository'
import { PrismaReservaRepository } from '../../../../infrastructure/persistence/hospitalidade/PrismaReservaRepository'
import { CalcularTarifaDinamicaUseCase } from '../../../../application/revenue/use-cases/CalcularTarifaDinamicaUseCase'
import { ValidarViolacaoBreakEvenUseCase } from '../../../../application/revenue/use-cases/ValidarViolacaoBreakEvenUseCase'
import { SugerirDescontoEstrategicoUseCase } from '../../../../application/revenue/use-cases/SugerirDescontoEstrategicoUseCase'
import { GerarForecastDemandaUseCase } from '../../../../application/revenue/use-cases/GerarForecastDemandaUseCase'
import { CalcularMetricasRevenueUseCase } from '../../../../application/revenue/use-cases/CalcularMetricasRevenueUseCase'
import { RebalancearTarifasPorCanalUseCase } from '../../../../application/revenue/use-cases/RebalancearTarifasPorCanalUseCase'
import { ZeAnalystCognitiveService } from '../../../../application/revenue/cognitive/ZeAnalystCognitiveService'
import { Result } from '../../../../shared/Result'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const session = authResult.value
    const propertyId = session.pousadaId

    const body = await request.json()
    const { intent, messageId, payload } = body || {}

    if (!intent) {
      return NextResponse.json({ error: 'Missing intent parameter' }, { status: 400 })
    }

    // Instanciação manual de dependências com isolamento de tenant usando basePrisma
    const basePrisma = getBasePrisma()
    const tarifaRepo = new PrismaTarifaRepository(basePrisma, propertyId)
    const ocupacaoRepo = new PrismaOcupacaoRepository(basePrisma, propertyId)
    const sazRepo = new PrismaSazonalidadeRepository(basePrisma, propertyId)
    const forecastRepo = new PrismaForecastRepository(basePrisma, propertyId)

    // Repositórios compartilhados e adaptados para leitura real
    const reservaRepo = new PrismaReservaRepository(basePrisma, propertyId)
    const pacoteRepo = new PrismaPacoteRepository(basePrisma, propertyId)
    const propostaRepo = new PrismaPropostaRepository(basePrisma, propertyId)

    // Adaptadores ReadOnly reais integrados com banco
    const reservaRO = {
      contarReservasConfirmadasPorPeriodo: async (propriedadeId: string, inicio: Date, fim: Date) => {
        try {
          const count = await basePrisma.reservation.count({
            where: {
              propertyId: propriedadeId,
              status: 'CONFIRMED',
              checkIn: { gte: inicio },
              checkOut: { lte: fim }
            }
          })
          return Result.ok<number, Error>(count)
        } catch (err) {
          return Result.fail<number, Error>(err instanceof Error ? err : new Error('Failed to count reservations'))
        }
      },
      contarReservasAtivasPorData: async (propriedadeId: string, data: Date) => {
        try {
          const count = await basePrisma.reservation.count({
            where: {
              propertyId: propriedadeId,
              status: 'CONFIRMED',
              checkIn: { lte: data },
              checkOut: { gte: data }
            }
          })
          return Result.ok<number, Error>(count)
        } catch (err) {
          return Result.fail<number, Error>(err instanceof Error ? err : new Error('Failed to count active reservations'))
        }
      }
    }

    const pacoteRO = {
      listarPacotesAtivosPorPropriedade: async (propId: string) => {
        const result = await pacoteRepo.listarPacotesPorPropriedade(propId)
        if (result.isFail) {
          return Result.fail<Array<{ id: string; nome: string; tipoQuarto: string; valor: number }>, Error>(result.error)
        }
        const mapped = result.value.map(p => ({
          id: p.id,
          nome: p.nome,
          tipoQuarto: p.tipoQuarto ?? 'Standard',
          valor: p.regraPrecificacao?.valorBase?.valor ?? 0
        }))
        return Result.ok<Array<{ id: string; nome: string; tipoQuarto: string; valor: number }>, Error>(mapped)
      }
    }

    const propostaRO = {
      buscarPropostaPorId: async (id: string, propId: string) => {
        const result = await propostaRepo.buscarPropostaPorId(id, propId)
        return result
      },
      contarPropostasPorLeadComMaisDe: async (propriedadeId: string, dias: number) => {
        try {
          const cutOffDate = new Date();
          cutOffDate.setDate(cutOffDate.getDate() - dias);
          const count = await basePrisma.comercialProposta.count({
            where: {
              propriedadeId,
              dataCriacao: { gte: cutOffDate }
            }
          });
          return Result.ok<number, Error>(count);
        } catch (err) {
          return Result.fail<number, Error>(err instanceof Error ? err : new Error('Failed to count proposals'));
        }
      }
    }

    const calcularTarifaUC = new CalcularTarifaDinamicaUseCase(tarifaRepo, ocupacaoRepo, sazRepo)
    const validarBEUC = new ValidarViolacaoBreakEvenUseCase(tarifaRepo)
    const sugerirDescUC = new SugerirDescontoEstrategicoUseCase(ocupacaoRepo, propostaRO)
    const gerarForecastUC = new GerarForecastDemandaUseCase(ocupacaoRepo, sazRepo, forecastRepo)
    const calcularMetricasUC = new CalcularMetricasRevenueUseCase(ocupacaoRepo)
    const rebalancearUC = new RebalancearTarifasPorCanalUseCase(tarifaRepo)

    const analystService = new ZeAnalystCognitiveService(
      tarifaRepo,
      ocupacaoRepo,
      sazRepo,
      forecastRepo,
      reservaRO,
      pacoteRO,
      propostaRO,
      calcularTarifaUC,
      validarBEUC,
      sugerirDescUC,
      gerarForecastUC,
      calcularMetricasUC,
      rebalancearUC,
      process.env.ZCP_SECRET ?? 'zehla_secret_zcp_2026'
    )

    const output = await analystService.processIntent({
      intent,
      messageId: messageId || `api-${Date.now()}`,
      propriedadeId: propertyId,
      payload: payload || {}
    })

    if (!output.success) {
      return NextResponse.json(output, { status: 400 })
    }

    return NextResponse.json(output, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
