import { PrismaClient } from '@prisma/client'
import { Result } from '../../../shared/Result'
import { Sazonalidade } from '../../../domain/revenue/entities/Sazonalidade'
import { ISazonalidadePort } from '../../../application/revenue/ports/ISazonalidadePort'

export class PrismaSazonalidadeRepository implements ISazonalidadePort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(sazonalidade: Sazonalidade): any {
    return {
      id: sazonalidade.id,
      propriedadeId: sazonalidade.propriedadeId,
      nome: sazonalidade.nome,
      tipo: sazonalidade.tipo,
      multiplicadorPreco: sazonalidade.multiplicadorPreco,
      dataInicio: sazonalidade.dataInicio,
      dataFim: sazonalidade.dataFim,
      recorrente: sazonalidade.recorrente,
      diasMinimosEstadia: sazonalidade.diasMinimosEstadia ?? null,
      regrasEspeciais: sazonalidade.regrasEspeciais,
    }
  }

  private async hydrate(row: any): Promise<Result<Sazonalidade, Error>> {
    try {
      return Sazonalidade.create({
        id: row.id,
        propriedadeId: row.propriedadeId,
        nome: row.nome,
        tipo: row.tipo,
        multiplicadorPreco: row.multiplicadorPreco,
        dataInicio: row.dataInicio,
        dataFim: row.dataFim,
        recorrente: row.recorrente,
        diasMinimosEstadia: row.diasMinimosEstadia ?? undefined,
        regrasEspeciais: row.regrasEspeciais || [],
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar sazonalidade'))
    }
  }

  async criarRegraSazonal(dados: {
    propriedadeId: string
    nome: string
    tipo: string
    multiplicadorPreco: number
    dataInicio: Date
    dataFim: Date
    recorrente?: boolean
    diasMinimosEstadia?: number
    regrasEspeciais?: string[]
  }): Promise<Result<Sazonalidade, Error>> {
    try {
      const sazResult = Sazonalidade.create({
        id: `saz_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        propriedadeId: dados.propriedadeId,
        nome: dados.nome,
        tipo: dados.tipo,
        multiplicadorPreco: dados.multiplicadorPreco,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim,
        recorrente: dados.recorrente,
        diasMinimosEstadia: dados.diasMinimosEstadia,
        regrasEspeciais: dados.regrasEspeciais,
      })
      if (sazResult.isFail) return sazResult

      const sazonalidade = sazResult.value
      await this.prisma.revenueSazonalidade.create({ data: this.toData(sazonalidade) })
      return Result.ok(sazonalidade)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao criar regra sazonal'))
    }
  }

  async buscarPorData(propriedadeId: string, data: Date): Promise<Result<Sazonalidade | null, Error>> {
    try {
      const row = await this.prisma.revenueSazonalidade.findFirst({
        where: {
          propriedadeId,
          dataInicio: { lte: data },
          dataFim: { gte: data },
        },
        orderBy: { dataFim: 'desc' },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar sazonalidade por data'))
    }
  }

  async listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Sazonalidade[], Error>> {
    try {
      const rows = await this.prisma.revenueSazonalidade.findMany({
        where: {
          propriedadeId,
          dataInicio: { lte: dataFim },
          dataFim: { gte: dataInicio },
        },
        orderBy: { dataInicio: 'asc' },
      })
      const sazonalidades: Sazonalidade[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        sazonalidades.push(result.value)
      }
      return Result.ok(sazonalidades)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar sazonalidades por período'))
    }
  }

  async listarProximosFeriados(propriedadeId: string, dias: number): Promise<Result<Sazonalidade[], Error>> {
    try {
      const hoje = new Date()
      const limite = new Date(hoje.getTime() + dias * 24 * 60 * 60 * 1000)
      const rows = await this.prisma.revenueSazonalidade.findMany({
        where: {
          propriedadeId,
          tipo: 'feriado',
          dataInicio: { gte: hoje, lte: limite },
        },
        orderBy: { dataInicio: 'asc' },
      })
      const sazonalidades: Sazonalidade[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        sazonalidades.push(result.value)
      }
      return Result.ok(sazonalidades)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar próximos feriados'))
    }
  }
}
