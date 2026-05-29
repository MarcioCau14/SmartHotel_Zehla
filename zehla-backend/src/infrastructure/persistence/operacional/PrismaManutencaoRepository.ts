import { PrismaClient } from '@prisma/client'
import { IManutencaoPort } from '../../../application/operacional/ports/IManutencaoPort'
import { Manutencao, StatusManutencao, TipoManutencao, CategoriaManutencao } from '../../../domain/operacional/entities/Manutencao'
import { Gravidade } from '../../../domain/operacional/value-objects/Gravidade'
import { Result } from '../../../shared/Result'

export class PrismaManutencaoRepository implements IManutencaoPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toData(m: Manutencao): any {
    return {
      id: m.id,
      tarefaId: m.tarefaId,
      propriedadeId: m.propriedadeId,
      dataAbertura: m.dataAbertura,
      tipo: m.tipo,
      gravidade: m.gravidade.value,
      categoria: m.categoria,
      ativoId: m.ativoId ?? null,
      tipoAtivo: m.tipoAtivo ?? null,
      descricaoProblema: m.descricaoProblema,
      descricaoSolucao: m.descricaoSolucao ?? null,
      dataInicio: m.dataInicio ?? null,
      dataFim: m.dataFim ?? null,
      fornecedorId: m.fornecedorId ?? null,
      custoPecas: m.custoPecas ?? null,
      custoServico: m.custoServico ?? null,
      status: m.status,
      interditaQuarto: m.interditaQuarto,
      requerAprovacaoHumana: m.requerAprovacaoHumana,
    }
  }

  private hydrate(row: any): Result<Manutencao, Error> {
    try {
      const gravidadeResult = Gravidade.criar(row.gravidade)
      if (gravidadeResult.isFail) return Result.fail(gravidadeResult.error)

      return Manutencao.create({
        id: row.id,
        tarefaId: row.tarefaId,
        propriedadeId: row.propriedadeId,
        dataAbertura: row.dataAbertura,
        tipo: row.tipo as TipoManutencao,
        gravidade: gravidadeResult.value,
        categoria: row.categoria as CategoriaManutencao,
        ativoId: row.ativoId ?? undefined,
        tipoAtivo: row.tipoAtivo ?? undefined,
        descricaoProblema: row.descricaoProblema,
        descricaoSolucao: row.descricaoSolucao ?? undefined,
        dataInicio: row.dataInicio ?? undefined,
        dataFim: row.dataFim ?? undefined,
        fornecedorId: row.fornecedorId ?? undefined,
        custoPecas: row.custoPecas ?? undefined,
        custoServico: row.custoServico ?? undefined,
        status: row.status as StatusManutencao,
        interditaQuarto: row.interditaQuarto ?? false,
        requerAprovacaoHumana: row.requerAprovacaoHumana ?? false,
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar manutenção'))
    }
  }

  async criarManutencao(dados: {
    tarefaId: string
    propriedadeId: string
    tipo: TipoManutencao
    gravidade: Gravidade
    categoria: CategoriaManutencao
    ativoId?: string
    tipoAtivo?: string
    descricaoProblema: string
    fornecedorId?: string
    requerAprovacaoHumana?: boolean
  }): Promise<Result<Manutencao, Error>> {
    try {
      const manutencaoResult = Manutencao.create({
        id: `manut_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        tarefaId: dados.tarefaId,
        propriedadeId: dados.propriedadeId,
        dataAbertura: new Date(),
        tipo: dados.tipo,
        gravidade: dados.gravidade,
        categoria: dados.categoria,
        ativoId: dados.ativoId,
        tipoAtivo: dados.tipoAtivo,
        descricaoProblema: dados.descricaoProblema,
        fornecedorId: dados.fornecedorId,
        requerAprovacaoHumana: dados.requerAprovacaoHumana,
      })
      if (manutencaoResult.isFail) return manutencaoResult

      const manutencao = manutencaoResult.value
      await this.prisma.operacionalManutencao.create({ data: this.toData(manutencao) })
      return Result.ok(manutencao)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao criar manutenção'))
    }
  }

  async buscarManutencaoPorId(id: string, propriedadeId: string): Promise<Result<Manutencao | null, Error>> {
    try {
      const row = await this.prisma.operacionalManutencao.findFirst({
        where: { id, propriedadeId },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar manutenção'))
    }
  }

  async listarManutencoesPorPropriedade(propriedadeId: string, filtros?: {
    status?: StatusManutencao[]
    gravidade?: string
    tipo?: TipoManutencao[]
    dataInicio?: Date
    dataFim?: Date
  }): Promise<Result<Manutencao[], Error>> {
    try {
      const where: any = { propriedadeId }
      if (filtros?.status && filtros.status.length > 0) {
        where.status = { in: filtros.status }
      }
      if (filtros?.gravidade) {
        where.gravidade = filtros.gravidade
      }
      if (filtros?.tipo && filtros.tipo.length > 0) {
        where.tipo = { in: filtros.tipo }
      }
      if (filtros?.dataInicio) {
        where.dataAbertura = { ...where.dataAbertura, gte: filtros.dataInicio }
      }
      if (filtros?.dataFim) {
        where.dataAbertura = { ...where.dataAbertura, lte: filtros.dataFim }
      }

      const rows = await this.prisma.operacionalManutencao.findMany({ where, orderBy: { dataAbertura: 'desc' } })
      const result: Manutencao[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar manutenções'))
    }
  }

  async listarManutencoesPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Manutencao[], Error>> {
    try {
      const rows = await this.prisma.operacionalManutencao.findMany({
        where: { ativoId, propriedadeId },
        orderBy: { dataAbertura: 'desc' },
      })
      const result: Manutencao[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar manutenções por ativo'))
    }
  }

  async listarInterditadas(propriedadeId: string): Promise<Result<Manutencao[], Error>> {
    try {
      const rows = await this.prisma.operacionalManutencao.findMany({
        where: { propriedadeId, interditaQuarto: true, status: { notIn: ['concluida', 'cancelada'] } },
        orderBy: { dataAbertura: 'desc' },
      })
      const result: Manutencao[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar interditadas'))
    }
  }

  async atualizarManutencao(id: string, propriedadeId: string, dados: {
    status?: StatusManutencao
    descricaoSolucao?: string
    dataInicio?: Date
    dataFim?: Date
    custoPecas?: number
    custoServico?: number
  }): Promise<Result<Manutencao, Error>> {
    try {
      const row = await this.prisma.operacionalManutencao.findFirst({
        where: { id, propriedadeId },
      })
      if (!row) return Result.fail(new Error('Manutenção não encontrada ou acesso negado'))

      const currentResult = this.hydrate(row)
      if (currentResult.isFail) return currentResult

      let updated = currentResult.value
      if (dados.status === 'em_andamento') {
        const r = updated.iniciar()
        if (r.isFail) return r
        updated = r.value
      } else if (dados.status === 'concluida') {
        const r = updated.concluir(dados.descricaoSolucao ?? '', dados.custoPecas, dados.custoServico)
        if (r.isFail) return r
        updated = r.value
      }

      await this.prisma.operacionalManutencao.update({
        where: { id },
        data: this.toData(updated),
      })
      return Result.ok(updated)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao atualizar manutenção'))
    }
  }

  async countInterdicoes24h(propriedadeId: string): Promise<Result<number, Error>> {
    try {
      const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const count = await this.prisma.operacionalManutencao.count({
        where: {
          propriedadeId,
          gravidade: 'severa',
          dataAbertura: { gte: vinteQuatroHorasAtras },
          status: { notIn: ['cancelada'] },
        },
      })
      return Result.ok(count)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao contar interdições'))
    }
  }
}
