import { PrismaClient } from '@prisma/client'
import { ITarefaPort } from '../../../application/operacional/ports/ITarefaPort'
import { Tarefa, StatusTarefa, TipoTarefa } from '../../../domain/operacional/entities/Tarefa'
import { Prioridade } from '../../../domain/operacional/value-objects/Prioridade'
import { Result } from '../../../shared/Result'

export class PrismaTarefaRepository implements ITarefaPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toData(tarefa: Tarefa): any {
    return {
      id: tarefa.id,
      propriedadeId: tarefa.propriedadeId,
      dataCriacao: tarefa.dataCriacao,
      tipo: tarefa.tipo,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao ?? null,
      prioridade: tarefa.prioridade.value,
      status: tarefa.status,
      responsavelId: tarefa.responsavelId ?? null,
      tipoResponsavel: tarefa.tipoResponsavel ?? null,
      ativoId: tarefa.ativoId ?? null,
      tipoAtivo: tarefa.tipoAtivo ?? null,
      dataLimite: tarefa.dataLimite ?? null,
      dataConclusao: tarefa.dataConclusao ?? null,
      observacoes: tarefa.observacoes ?? null,
    }
  }

  private hydrate(row: any): Result<Tarefa, Error> {
    try {
      const prioridadeResult = Prioridade.criar(row.prioridade)
      if (prioridadeResult.isFail) return Result.fail(prioridadeResult.error)

      return Tarefa.create({
        id: row.id,
        propriedadeId: row.propriedadeId,
        dataCriacao: row.dataCriacao,
        tipo: row.tipo as TipoTarefa,
        titulo: row.titulo,
        descricao: row.descricao ?? undefined,
        prioridade: prioridadeResult.value,
        status: row.status as StatusTarefa,
        responsavelId: row.responsavelId ?? undefined,
        tipoResponsavel: row.tipoResponsavel ?? undefined,
        ativoId: row.ativoId ?? undefined,
        tipoAtivo: row.tipoAtivo ?? undefined,
        dataLimite: row.dataLimite ?? undefined,
        dataConclusao: row.dataConclusao ?? undefined,
        observacoes: row.observacoes ?? undefined,
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar tarefa'))
    }
  }

  async criarTarefa(dados: {
    tipo: TipoTarefa
    propriedadeId: string
    titulo: string
    descricao?: string
    prioridade?: Prioridade
    responsavelId?: string
    tipoResponsavel?: 'staff' | 'fornecedor'
    ativoId?: string
    tipoAtivo?: string
    dataLimite?: Date
    dataCriacao?: Date
  }): Promise<Result<Tarefa, Error>> {
    try {
      const prioridade = dados.prioridade ?? Prioridade.media()
      const tarefaResult = Tarefa.create({
        id: `tarefa_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        propriedadeId: dados.propriedadeId,
        dataCriacao: dados.dataCriacao ?? new Date(),
        tipo: dados.tipo,
        titulo: dados.titulo,
        descricao: dados.descricao,
        prioridade,
        responsavelId: dados.responsavelId,
        tipoResponsavel: dados.tipoResponsavel,
        ativoId: dados.ativoId,
        tipoAtivo: dados.tipoAtivo,
        dataLimite: dados.dataLimite,
      })
      if (tarefaResult.isFail) return tarefaResult

      const tarefa = tarefaResult.value
      await this.prisma.operacionalTarefa.create({ data: this.toData(tarefa) })
      return Result.ok(tarefa)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao criar tarefa'))
    }
  }

  async buscarTarefaPorId(id: string, propriedadeId: string): Promise<Result<Tarefa | null, Error>> {
    try {
      const row = await this.prisma.operacionalTarefa.findFirst({
        where: { id, propriedadeId },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar tarefa'))
    }
  }

  async listarTarefasPorPropriedade(propriedadeId: string, filtros?: {
    status?: StatusTarefa[]
    tipo?: TipoTarefa[]
    dataInicio?: Date
    dataFim?: Date
  }): Promise<Result<Tarefa[], Error>> {
    try {
      const where: any = { propriedadeId }
      if (filtros?.status && filtros.status.length > 0) {
        where.status = { in: filtros.status }
      }
      if (filtros?.tipo && filtros.tipo.length > 0) {
        where.tipo = { in: filtros.tipo }
      }
      if (filtros?.dataInicio) {
        where.dataCriacao = { ...where.dataCriacao, gte: filtros.dataInicio }
      }
      if (filtros?.dataFim) {
        where.dataCriacao = { ...where.dataCriacao, lte: filtros.dataFim }
      }

      const rows = await this.prisma.operacionalTarefa.findMany({ where, orderBy: { dataCriacao: 'desc' } })
      const tarefas: Tarefa[] = []
      for (const row of rows) {
        const result = this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        tarefas.push(result.value)
      }
      return Result.ok(tarefas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar tarefas'))
    }
  }

  async listarTarefasPorResponsavel(responsavelId: string, propriedadeId: string): Promise<Result<Tarefa[], Error>> {
    try {
      const rows = await this.prisma.operacionalTarefa.findMany({
        where: { responsavelId, propriedadeId },
        orderBy: { dataCriacao: 'desc' },
      })
      const tarefas: Tarefa[] = []
      for (const row of rows) {
        const result = this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        tarefas.push(result.value)
      }
      return Result.ok(tarefas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar tarefas por responsável'))
    }
  }

  async listarTarefasAtrasadas(propriedadeId: string): Promise<Result<Tarefa[], Error>> {
    try {
      const rows = await this.prisma.operacionalTarefa.findMany({
        where: {
          propriedadeId,
          status: { notIn: ['concluida', 'cancelada'] },
          dataLimite: { lte: new Date() },
        },
        orderBy: { dataLimite: 'asc' },
      })
      const tarefas: Tarefa[] = []
      for (const row of rows) {
        const result = this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        tarefas.push(result.value)
      }
      return Result.ok(tarefas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar tarefas atrasadas'))
    }
  }

  async listarTarefasPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Tarefa[], Error>> {
    try {
      const rows = await this.prisma.operacionalTarefa.findMany({
        where: { ativoId, propriedadeId },
        orderBy: { dataCriacao: 'desc' },
      })
      const tarefas: Tarefa[] = []
      for (const row of rows) {
        const result = this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        tarefas.push(result.value)
      }
      return Result.ok(tarefas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar tarefas por ativo'))
    }
  }

  async atualizarTarefa(id: string, propriedadeId: string, dados: {
    status?: StatusTarefa
    responsavelId?: string
    tipoResponsavel?: 'staff' | 'fornecedor'
    dataConclusao?: Date
    observacoes?: string
  }): Promise<Result<Tarefa, Error>> {
    try {
      const row = await this.prisma.operacionalTarefa.findFirst({
        where: { id, propriedadeId },
      })
      if (!row) return Result.fail(new Error('Tarefa não encontrada ou acesso negado'))

      const currentResult = this.hydrate(row)
      if (currentResult.isFail) return currentResult

      let updated = currentResult.value
      if (dados.status === 'em_andamento' && dados.responsavelId) {
        const result = updated.iniciar(dados.responsavelId, dados.tipoResponsavel ?? 'staff')
        if (result.isFail) return result
        updated = result.value
      } else if (dados.status === 'concluida') {
        const result = updated.concluir(dados.observacoes)
        if (result.isFail) return result
        updated = result.value
      } else if (dados.status === 'cancelada') {
        const result = updated.cancelar()
        if (result.isFail) return result
        updated = result.value
      }

      await this.prisma.operacionalTarefa.update({
        where: { id },
        data: this.toData(updated),
      })
      return Result.ok(updated)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao atualizar tarefa'))
    }
  }
}
