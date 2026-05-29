import { PrismaClient } from '@prisma/client'
import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { Ocupacao } from '../../../domain/revenue/entities/Ocupacao'
import { Percentual } from '../../../domain/revenue/value-objects/Percentual'
import { IOcupacaoPort } from '../../../application/revenue/ports/IOcupacaoPort'

export class PrismaOcupacaoRepository implements IOcupacaoPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toData(ocupacao: Ocupacao): any {
    return {
      id: ocupacao.id,
      propriedadeId: ocupacao.propriedadeId,
      data: ocupacao.data,
      tipo: ocupacao.tipo,
      totalQuartosDisponiveis: ocupacao.totalQuartosDisponiveis,
      totalQuartosOcupados: ocupacao.totalQuartosOcupados,
      totalReservasConfirmadas: ocupacao.totalReservasConfirmadas,
      totalReservasPendentes: ocupacao.totalReservasPendentes,
      receitaEstimada: ocupacao.receitaEstimada.centavos,
      dataCriacao: ocupacao.dataCriacao,
    }
  }

  private async hydrate(row: any): Promise<Result<Ocupacao, Error>> {
    try {
      const receitaResult = Money.criar(row.receitaEstimada)
      if (receitaResult.isFail) return Result.fail(receitaResult.error)

      return Ocupacao.create({
        id: row.id,
        propriedadeId: row.propriedadeId,
        data: row.data,
        tipo: row.tipo,
        totalQuartosDisponiveis: row.totalQuartosDisponiveis,
        totalQuartosOcupados: row.totalQuartosOcupados,
        totalReservasConfirmadas: row.totalReservasConfirmadas,
        totalReservasPendentes: row.totalReservasPendentes,
        receitaEstimada: receitaResult.value,
        dataCriacao: row.dataCriacao,
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar ocupação'))
    }
  }

  async registrarSnapshot(dados: {
    propriedadeId: string; data: Date; tipo: string
    totalQuartosDisponiveis: number; totalQuartosOcupados: number
    totalReservasConfirmadas: number; totalReservasPendentes: number
    receitaEstimada: Money
  }): Promise<Result<Ocupacao, Error>> {
    try {
      const ocupacaoResult = Ocupacao.create({
        id: `ocup_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        propriedadeId: dados.propriedadeId,
        data: dados.data,
        tipo: dados.tipo,
        totalQuartosDisponiveis: dados.totalQuartosDisponiveis,
        totalQuartosOcupados: dados.totalQuartosOcupados,
        totalReservasConfirmadas: dados.totalReservasConfirmadas,
        totalReservasPendentes: dados.totalReservasPendentes,
        receitaEstimada: dados.receitaEstimada,
      })
      if (ocupacaoResult.isFail) return ocupacaoResult

      const ocupacao = ocupacaoResult.value
      await this.prisma.revenueOcupacao.create({ data: this.toData(ocupacao) })
      return Result.ok(ocupacao)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao registrar snapshot de ocupação'))
    }
  }

  async buscarPorData(propriedadeId: string, data: Date): Promise<Result<Ocupacao | null, Error>> {
    try {
      const dataStr = data.toISOString().split('T')[0]
      const row = await this.prisma.revenueOcupacao.findFirst({
        where: {
          propriedadeId,
          data: {
            gte: new Date(`${dataStr}T00:00:00.000Z`),
            lte: new Date(`${dataStr}T23:59:59.999Z`),
          },
        },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar ocupação por data'))
    }
  }

  async listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Ocupacao[], Error>> {
    try {
      const rows = await this.prisma.revenueOcupacao.findMany({
        where: {
          propriedadeId,
          data: { gte: dataInicio, lte: dataFim },
        },
        orderBy: { data: 'asc' },
      })
      const ocupacoes: Ocupacao[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        ocupacoes.push(result.value)
      }
      return Result.ok(ocupacoes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar ocupações por período'))
    }
  }

  async mediaOcupacaoPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Percentual, Error>> {
    try {
      const rows = await this.prisma.revenueOcupacao.findMany({
        where: {
          propriedadeId,
          data: { gte: dataInicio, lte: dataFim },
        },
      })
      if (rows.length === 0) return Percentual.criar(0)
      const soma = rows.reduce((acc, row) => acc + Math.round((row.totalQuartosOcupados / row.totalQuartosDisponiveis) * 100), 0)
      return Percentual.criar(Math.round(soma / rows.length))
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao calcular média de ocupação'))
    }
  }
}
