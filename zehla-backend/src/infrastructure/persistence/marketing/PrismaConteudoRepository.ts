import { PrismaClient } from '@prisma/client'
import { Result } from '../../../shared/Result'
import { IConteudoPort } from '../../../application/marketing/ports/IConteudoPort'
import { Conteudo } from '../../../domain/marketing/entities/Conteudo'

export class PrismaConteudoRepository implements IConteudoPort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(conteudo: Conteudo): any {
    return {
      id: conteudo.id,
      texto: conteudo.texto,
      tom: conteudo.tom,
      versao: conteudo.versao,
      conteudoAnteriorId: conteudo.conteudoAnteriorId,
      dataCriacao: conteudo.dataCriacao,
    }
  }

  private async hydrate(row: any): Promise<Result<Conteudo, Error>> {
    try {
      const result = Conteudo.create({
        id: row.id,
        texto: row.texto,
        tom: row.tom,
        versao: row.versao,
        conteudoAnteriorId: row.conteudoAnteriorId ?? null,
        dataCriacao: row.dataCriacao,
      })
      if (result.isFail) return Result.fail(result.error)
      return Result.ok(result.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar MarketingConteudo'))
    }
  }

  async criarConteudo(dados: {
    texto: string; tom: string; conteudoAnteriorId?: string
  }): Promise<Result<Conteudo, Error>> {
    try {
      const id = `mkt_cont_${Date.now()}_${Math.floor(Math.random() * 10000)}`

      const conteudoResult = Conteudo.create({
        id,
        texto: dados.texto,
        tom: dados.tom,
        conteudoAnteriorId: dados.conteudoAnteriorId,
      })
      if (conteudoResult.isFail) return conteudoResult

      const conteudo = conteudoResult.value
      await this.prisma.marketingConteudo.create({ data: this.toData(conteudo) })
      return Result.ok(conteudo)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao criar conteúdo'))
    }
  }

  async buscarPorId(id: string): Promise<Result<Conteudo | null, Error>> {
    try {
      const row = await this.prisma.marketingConteudo.findUnique({ where: { id } })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar conteúdo'))
    }
  }

  async listarVersoes(conteudoId: string): Promise<Result<Conteudo[], Error>> {
    try {
      const rows = await this.prisma.marketingConteudo.findMany({
        where: {
          OR: [
            { id: conteudoId },
            { conteudoAnteriorId: conteudoId },
          ],
        },
        orderBy: { versao: 'asc' },
      })
      const conteudos: Conteudo[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        conteudos.push(result.value)
      }
      return Result.ok(conteudos)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar versões de conteúdo'))
    }
  }
}
