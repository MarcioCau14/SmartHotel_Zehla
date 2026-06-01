import { PrismaClient } from '@prisma/client'
import { Result } from '../../../shared/Result'
import { ICampanhaPort } from '../../../application/marketing/ports/ICampanhaPort'
import { Campanha, StatusCampanha } from '../../../domain/marketing/entities/Campanha'

export class PrismaCampanhaRepository implements ICampanhaPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toData(campanha: Campanha): any {
    return {
      id: campanha.id,
      pousadaId: campanha.propriedadeId,
      nome: campanha.nome,
      publicoAlvo: campanha.publicoAlvo,
      tipo: campanha.tipo,
      conteudo: campanha.conteudo,
      dataInicio: campanha.dataInicio,
      dataFim: campanha.dataFim,
      status: campanha.status,
      possuiPromiseFinanceira: campanha.possuiPromiseFinanceira,
      promiseFinanceiraValidada: campanha.promiseFinanceiraValidada,
      dataCriacao: campanha.dataCriacao,
    }
  }

  private async hydrate(row: any): Promise<Result<Campanha, Error>> {
    try {
      const result = Campanha.create({
        id: row.id,
        propriedadeId: row.pousadaId,
        nome: row.nome,
        publicoAlvo: row.publicoAlvo,
        tipo: row.tipo,
        conteudo: row.conteudo ?? null,
        dataInicio: row.dataInicio,
        dataFim: row.dataFim,
        status: row.status as StatusCampanha,
        possuiPromiseFinanceira: row.possuiPromiseFinanceira ?? false,
        promiseFinanceiraValidada: row.promiseFinanceiraValidada ?? false,
        dataCriacao: row.dataCriacao,
      })
      if (result.isFail) return Result.fail(result.error)
      return Result.ok(result.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar MarketingCampanha'))
    }
  }

  async criarCampanha(dados: {
    propriedadeId: string; nome: string; publicoAlvo: string; tipo: string
    conteudo?: string; dataInicio: Date; dataFim: Date
    possuiPromiseFinanceira?: boolean; promiseFinanceiraValidada?: boolean
  }): Promise<Result<Campanha, Error>> {
    try {
      const id = `mkt_camp_${Date.now()}_${Math.floor(Math.random() * 10000)}`

      const campanhaResult = Campanha.create({
        id,
        propriedadeId: dados.propriedadeId,
        nome: dados.nome,
        publicoAlvo: dados.publicoAlvo,
        tipo: dados.tipo,
        conteudo: dados.conteudo,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim,
        possuiPromiseFinanceira: dados.possuiPromiseFinanceira,
        promiseFinanceiraValidada: dados.promiseFinanceiraValidada,
      })
      if (campanhaResult.isFail) return campanhaResult

      const campanha = campanhaResult.value
      await this.prisma.marketingCampanha.create({ data: this.toData(campanha) })
      return Result.ok(campanha)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao criar campanha'))
    }
  }

  async buscarPorId(id: string, propriedadeId: string): Promise<Result<Campanha | null, Error>> {
    try {
      const row = await this.prisma.marketingCampanha.findFirst({
        where: { id, pousadaId: propriedadeId },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar campanha'))
    }
  }

  async listarAtivas(propriedadeId: string): Promise<Result<Campanha[], Error>> {
    try {
      const rows = await this.prisma.marketingCampanha.findMany({
        where: {
          pousadaId: propriedadeId,
          status: { in: ['aprovada', 'agendada', 'em_execucao'] },
        },
        orderBy: { dataCriacao: 'desc' },
      })
      const campanhas: Campanha[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        campanhas.push(result.value)
      }
      return Result.ok(campanhas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar campanhas ativas'))
    }
  }

  async atualizarStatus(id: string, propriedadeId: string, status: StatusCampanha): Promise<Result<Campanha, Error>> {
    try {
      const row = await this.prisma.marketingCampanha.findFirst({
        where: { id, pousadaId: propriedadeId },
      })
      if (!row) return Result.fail(new Error('Campanha não encontrada'))

      const currentResult = await this.hydrate(row)
      if (currentResult.isFail) return currentResult

      let updated = currentResult.value
      if (status === 'aprovada') {
        const r = updated.aprovar()
        if (r.isFail) return r
        updated = r.value
      } else if (status === 'cancelada') {
        const r = updated.cancelar()
        if (r.isFail) return r
        updated = r.value
      } else if (status === 'concluida') {
        const r = updated.concluir()
        if (r.isFail) return r
        updated = r.value
      }

      await this.prisma.marketingCampanha.update({
        where: { id },
        data: { status: updated.status },
      })
      return Result.ok(updated)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao atualizar status da campanha'))
    }
  }

  async cancelarCampanha(id: string, propriedadeId: string): Promise<Result<Campanha, Error>> {
    return this.atualizarStatus(id, propriedadeId, 'cancelada')
  }

  async listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Campanha[], Error>> {
    try {
      const rows = await this.prisma.marketingCampanha.findMany({
        where: {
          pousadaId: propriedadeId,
          dataInicio: { gte: dataInicio, lte: dataFim },
        },
        orderBy: { dataCriacao: 'desc' },
      })
      const campanhas: Campanha[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        campanhas.push(result.value)
      }
      return Result.ok(campanhas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar campanhas por período'))
    }
  }
}
