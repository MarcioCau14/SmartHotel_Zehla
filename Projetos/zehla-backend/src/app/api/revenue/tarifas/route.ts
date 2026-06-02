import { NextRequest, NextResponse } from 'next/server'
import { getBasePrisma } from '../../../../lib/prisma'
import { authenticateRequest } from '../../../../infrastructure/http/auth/jwtAuth'
import { PrismaTarifaRepository } from '../../../../infrastructure/persistence/revenue/PrismaTarifaRepository'
import { PrismaOcupacaoRepository } from '../../../../infrastructure/persistence/revenue/PrismaOcupacaoRepository'
import { PrismaSazonalidadeRepository } from '../../../../infrastructure/persistence/revenue/PrismaSazonalidadeRepository'
import { PrismaForecastRepository } from '../../../../infrastructure/persistence/revenue/PrismaForecastRepository'
import { PrismaPacoteRepository } from '../../../../infrastructure/persistence/comercial/PrismaPacoteRepository'
import { IReservaReadOnlyPort } from '../../../../application/revenue/ports/IReservaReadOnlyPort'
import { IPropostaReadOnlyPort } from '../../../../application/revenue/ports/IPropostaReadOnlyPort'
import { IPacoteReadOnlyPort } from '../../../../application/revenue/ports/IPacoteReadOnlyPort'
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

    const body = await request.json()
    const { intent, messageId, payload } = body || {}

    if (!intent) {
      return NextResponse.json({ error: 'Missing intent parameter' }, { status: 400 })
    }

    // Instanciação manual de dependências com isolamento de tenant usando basePrisma
    const basePrisma = getBasePrisma()
    const tarifaRepo = new PrismaTarifaRepository(basePrisma)
    const ocupacaoRepo = new PrismaOcupacaoRepository(basePrisma)
    const sazRepo = new PrismaSazonalidadeRepository(basePrisma)
    const forecastRepo = new PrismaForecastRepository(basePrisma)

    const pacoteRepo = new PrismaPacoteRepository(basePrisma)

    // Adaptadores ReadOnly reais integrados com banco
    const reservaRO: IReservaReadOnlyPort = {
      contarReservasConfirmadasPorPeriodo: async (propriedadeId: string, dataInicio: Date, dataFim: Date) => {
        try {
          const count = await basePrisma.reservation.count({
            where: {
              propertyId: propriedadeId,
              status: 'CONFIRMED',
              checkIn: { gte: dataInicio },
              checkOut: { lte: dataFim }
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

    const pacoteRO: IPacoteReadOnlyPort = {
      listarPacotesAtivosPorPropriedade: async (propriedadeId: string) => {
        const result = await pacoteRepo.listarPacotesPorPropriedade(propriedadeId)
        if (result.isFail) return Result.fail<{ id: string; nome: string; tipoQuarto: string; valor: number }[], Error>(result.error)
        const mapped = result.value.map(p => ({
          id: p.id,
          nome: p.nome,
          tipoQuarto: p.tipoQuarto ?? '',
          valor: 0
        }))
        return Result.ok<{ id: string; nome: string; tipoQuarto: string; valor: number }[], Error>(mapped)
      }
    }

    const propostaRO: IPropostaReadOnlyPort = {
      contarPropostasPorLeadComMaisDe: async (propriedadeId: string, dias: number) => {
        return Result.ok<number, Error>(0)
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
      propriedadeId: session.pousadaId,
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
