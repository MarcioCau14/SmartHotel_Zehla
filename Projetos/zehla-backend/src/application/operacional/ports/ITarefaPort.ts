import { Result } from '../../../shared/Result'
import { Tarefa, StatusTarefa, TipoTarefa } from '../../../domain/operacional/entities/Tarefa'
import { Prioridade } from '../../../domain/operacional/value-objects/Prioridade'

export interface ITarefaPort {
  criarTarefa(dados: {
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
  }): Promise<Result<Tarefa, Error>>

  buscarTarefaPorId(id: string, propriedadeId: string): Promise<Result<Tarefa | null, Error>>

  listarTarefasPorPropriedade(propriedadeId: string, filtros?: {
    status?: StatusTarefa[]
    tipo?: TipoTarefa[]
    dataInicio?: Date
    dataFim?: Date
  }): Promise<Result<Tarefa[], Error>>

  listarTarefasPorResponsavel(responsavelId: string, propriedadeId: string): Promise<Result<Tarefa[], Error>>

  listarTarefasAtrasadas(propriedadeId: string): Promise<Result<Tarefa[], Error>>

  listarTarefasPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Tarefa[], Error>>

  atualizarTarefa(id: string, propriedadeId: string, dados: {
    status?: StatusTarefa
    responsavelId?: string
    tipoResponsavel?: 'staff' | 'fornecedor'
    dataConclusao?: Date
    observacoes?: string
  }): Promise<Result<Tarefa, Error>>
}
