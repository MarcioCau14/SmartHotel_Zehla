import { Result } from '../../../shared/Result'
import { ITarefaPort } from '../ports/ITarefaPort'
import { IStaffPort } from '../ports/IStaffPort'
import { IManutencaoPort } from '../ports/IManutencaoPort'
import { IChecklistPort } from '../ports/IChecklistPort'
import { Tarefa } from '../../../domain/operacional/entities/Tarefa'

export class ConcluirTarefaUseCase {
  constructor(
    private readonly tarefaPort: ITarefaPort,
    private readonly staffPort: IStaffPort,
    private readonly manutencaoPort: IManutencaoPort,
    private readonly checklistPort: IChecklistPort,
  ) {}

  async execute(dados: {
    tarefaId: string
    propriedadeId: string
    observacoes?: string
  }): Promise<Result<Tarefa, Error>> {
    try {
      const tarefaResult = await this.tarefaPort.buscarTarefaPorId(dados.tarefaId, dados.propriedadeId)
      if (tarefaResult.isFail) return Result.fail(tarefaResult.error)
      if (!tarefaResult.value) {
        return Result.fail(new Error('Tarefa não encontrada'))
      }

      const tarefa = tarefaResult.value

      if (tarefa.ativoId) {
        const checklistsPendentes = await this.checklistPort.listarPendentesPorAtivo(
          tarefa.ativoId, dados.propriedadeId,
        )
        if (checklistsPendentes.isOk && checklistsPendentes.value && checklistsPendentes.value.length > 0) {
          return Result.fail(new Error('Existem checklists pendentes para este ativo. Conclua-os antes de finalizar a tarefa.'))
        }
      }

      const tarefaConcluidaResult = tarefa.concluir(dados.observacoes)
      if (tarefaConcluidaResult.isFail) return Result.fail(tarefaConcluidaResult.error)

      const updateResult = await this.tarefaPort.atualizarTarefa(dados.tarefaId, dados.propriedadeId, {
        status: 'concluida',
        dataConclusao: new Date(),
        observacoes: dados.observacoes,
      })
      if (updateResult.isFail) return Result.fail(updateResult.error)

      if (tarefa.responsavelId && tarefa.tipoResponsavel === 'staff') {
        const staffAtual = await this.staffPort.buscarStaffPorId(tarefa.responsavelId, dados.propriedadeId)
        if (staffAtual.isOk && staffAtual.value) {
          const novoStaff = staffAtual.value.decrementarTarefas()
          if (novoStaff.isOk) {
            await this.staffPort.atualizarStaff(tarefa.responsavelId, dados.propriedadeId, {
              tarefasEmAndamento: novoStaff.value.tarefasEmAndamento,
            })
          }
        }
      }

      if (tarefa.tipo === 'manutencao') {
        const manutencaoResult = await this.manutencaoPort.listarManutencoesPorPropriedade(
          dados.propriedadeId, { status: ['em_andamento'] },
        )
        if (manutencaoResult.isOk && manutencaoResult.value) {
          const manutencaoRelacionada = manutencaoResult.value.find(m => m.tarefaId === dados.tarefaId)
          if (manutencaoRelacionada) {
            await this.manutencaoPort.atualizarManutencao(manutencaoRelacionada.id, dados.propriedadeId, {
              status: 'concluida',
              dataFim: new Date(),
            })
          }
        }
      }

      return Result.ok(updateResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao concluir tarefa'))
    }
  }
}
