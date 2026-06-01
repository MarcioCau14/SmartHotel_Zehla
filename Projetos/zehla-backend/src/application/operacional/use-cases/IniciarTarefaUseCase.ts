import { Result } from '../../../shared/Result'
import { ITarefaPort } from '../ports/ITarefaPort'
import { IStaffPort } from '../ports/IStaffPort'
import { IManutencaoPort } from '../ports/IManutencaoPort'
import { Tarefa } from '../../../domain/operacional/entities/Tarefa'

export class IniciarTarefaUseCase {
  constructor(
    private readonly tarefaPort: ITarefaPort,
    private readonly staffPort: IStaffPort,
    private readonly manutencaoPort: IManutencaoPort,
  ) {}

  async execute(dados: {
    tarefaId: string
    propriedadeId: string
    responsavelId: string
    tipoResponsavel: 'staff' | 'fornecedor'
  }): Promise<Result<Tarefa, Error>> {
    try {
      const tarefaResult = await this.tarefaPort.buscarTarefaPorId(dados.tarefaId, dados.propriedadeId)
      if (tarefaResult.isFail) return Result.fail(tarefaResult.error)
      if (!tarefaResult.value) {
        return Result.fail(new Error('Tarefa não encontrada'))
      }

      if (dados.tipoResponsavel === 'staff') {
        const staffResult = await this.staffPort.buscarStaffPorId(dados.responsavelId, dados.propriedadeId)
        if (staffResult.isFail) return Result.fail(staffResult.error)
        if (!staffResult.value) {
          return Result.fail(new Error('Staff não encontrado'))
        }
        if (!staffResult.value.podeReceberTarefa) {
          return Result.fail(new Error('Staff já possui 3 tarefas em andamento ou está inativo'))
        }
      }

      const tarefa = tarefaResult.value
      const tarefaIniciadaResult = tarefa.iniciar(dados.responsavelId, dados.tipoResponsavel)
      if (tarefaIniciadaResult.isFail) return Result.fail(tarefaIniciadaResult.error)

      const updateResult = await this.tarefaPort.atualizarTarefa(dados.tarefaId, dados.propriedadeId, {
        status: 'em_andamento',
        responsavelId: dados.responsavelId,
        tipoResponsavel: dados.tipoResponsavel,
      })
      if (updateResult.isFail) return Result.fail(updateResult.error)

      if (dados.tipoResponsavel === 'staff') {
        const staffAtual = await this.staffPort.buscarStaffPorId(dados.responsavelId, dados.propriedadeId)
        if (staffAtual.isOk && staffAtual.value) {
          const novoStaff = staffAtual.value.incrementarTarefas()
          if (novoStaff.isOk) {
            await this.staffPort.atualizarStaff(dados.responsavelId, dados.propriedadeId, {
              tarefasEmAndamento: novoStaff.value.tarefasEmAndamento,
            })
          }
        }
      }

      if (tarefa.tipo === 'manutencao') {
        const manutencaoResult = await this.manutencaoPort.listarManutencoesPorPropriedade(dados.propriedadeId, {
          status: ['aberta', 'agendada'],
        })
        if (manutencaoResult.isOk && manutencaoResult.value) {
          const manutencaoRelacionada = manutencaoResult.value.find(m => m.tarefaId === dados.tarefaId)
          if (manutencaoRelacionada) {
            const iniciada = manutencaoRelacionada.iniciar()
            if (iniciada.isOk) {
              await this.manutencaoPort.atualizarManutencao(manutencaoRelacionada.id, dados.propriedadeId, {
                status: 'em_andamento',
                dataInicio: new Date(),
              })
            }
          }
        }
      }

      return Result.ok(updateResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao iniciar tarefa'))
    }
  }
}
