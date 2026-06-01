import { Result } from '../../../shared/Result'
import { ITarefaPort } from '../../../application/operacional/ports/ITarefaPort'
import { Tarefa, StatusTarefa, TipoTarefa } from '../../../domain/operacional/entities/Tarefa'
import { Prioridade } from '../../../domain/operacional/value-objects/Prioridade'

export class TarefaInMemoryRepository implements ITarefaPort {
  private tarefas: Map<string, Tarefa> = new Map()

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
    const prioridade = dados.prioridade || Prioridade.media()
    const tarefaResult = Tarefa.create({
      id: `tarefa_${this.tarefas.size + 1}_${Date.now()}`,
      propriedadeId: dados.propriedadeId,
      dataCriacao: dados.dataCriacao || new Date(),
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
    this.tarefas.set(tarefaResult.value.id, tarefaResult.value)
    return Result.ok(tarefaResult.value)
  }

  async buscarTarefaPorId(id: string, propriedadeId: string): Promise<Result<Tarefa | null, Error>> {
    const tarefa = this.tarefas.get(id)
    if (!tarefa || tarefa.propriedadeId !== propriedadeId) return Result.ok(null)
    return Result.ok(tarefa)
  }

  async listarTarefasPorPropriedade(propriedadeId: string, filtros?: {
    status?: StatusTarefa[]
    tipo?: TipoTarefa[]
    dataInicio?: Date
    dataFim?: Date
  }): Promise<Result<Tarefa[], Error>> {
    let lista = Array.from(this.tarefas.values()).filter(t => t.propriedadeId === propriedadeId)
    if (filtros?.status) lista = lista.filter(t => filtros.status!.includes(t.status))
    if (filtros?.tipo) lista = lista.filter(t => filtros.tipo!.includes(t.tipo))
    if (filtros?.dataInicio) lista = lista.filter(t => t.dataCriacao >= filtros.dataInicio!)
    if (filtros?.dataFim) lista = lista.filter(t => t.dataCriacao <= filtros.dataFim!)
    return Result.ok(lista)
  }

  async listarTarefasPorResponsavel(responsavelId: string, propriedadeId: string): Promise<Result<Tarefa[], Error>> {
    const lista = Array.from(this.tarefas.values()).filter(
      t => t.propriedadeId === propriedadeId && t.responsavelId === responsavelId,
    )
    return Result.ok(lista)
  }

  async listarTarefasAtrasadas(propriedadeId: string): Promise<Result<Tarefa[], Error>> {
    const lista = Array.from(this.tarefas.values()).filter(
      t => t.propriedadeId === propriedadeId && t.estaAtrasada,
    )
    return Result.ok(lista)
  }

  async listarTarefasPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Tarefa[], Error>> {
    const lista = Array.from(this.tarefas.values()).filter(
      t => t.propriedadeId === propriedadeId && t.ativoId === ativoId,
    )
    return Result.ok(lista)
  }

  async atualizarTarefa(id: string, propriedadeId: string, dados: {
    status?: StatusTarefa
    responsavelId?: string
    tipoResponsavel?: 'staff' | 'fornecedor'
    dataConclusao?: Date
    observacoes?: string
  }): Promise<Result<Tarefa, Error>> {
    const tarefa = this.tarefas.get(id)
    if (!tarefa || tarefa.propriedadeId !== propriedadeId) {
      return Result.fail(new Error('Tarefa não encontrada'))
    }

    const novaTarefaResult = Tarefa.create({
      id: tarefa.id,
      propriedadeId: tarefa.propriedadeId,
      dataCriacao: tarefa.dataCriacao,
      tipo: tarefa.tipo,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      prioridade: tarefa.prioridade,
      status: dados.status || tarefa.status,
      responsavelId: dados.responsavelId || tarefa.responsavelId,
      tipoResponsavel: dados.tipoResponsavel || tarefa.tipoResponsavel,
      ativoId: tarefa.ativoId,
      tipoAtivo: tarefa.tipoAtivo,
      dataLimite: tarefa.dataLimite,
      dataConclusao: dados.dataConclusao || tarefa.dataConclusao,
      observacoes: dados.observacoes || tarefa.observacoes,
    })
    if (novaTarefaResult.isFail) return novaTarefaResult
    this.tarefas.set(id, novaTarefaResult.value)
    return Result.ok(novaTarefaResult.value)
  }
}
