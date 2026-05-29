import { Result } from '../../../shared/Result'
import { ITarefaPort } from '../ports/ITarefaPort'
import { IStaffPort } from '../ports/IStaffPort'
import { ISlaPort } from '../ports/ISlaPort'
import { Tarefa, TipoTarefa } from '../../../domain/operacional/entities/Tarefa'
import { Prioridade } from '../../../domain/operacional/value-objects/Prioridade'

export class CriarTarefaUseCase {
  constructor(
    private readonly tarefaPort: ITarefaPort,
    private readonly staffPort: IStaffPort,
    private readonly slaPort: ISlaPort,
  ) {}

  async execute(dados: {
    tipo: string
    propriedadeId: string
    titulo: string
    descricao?: string
    prioridade?: string
    responsavelId?: string
    tipoResponsavel?: 'staff' | 'fornecedor'
    ativoId?: string
    tipoAtivo?: string
  }): Promise<Result<Tarefa, Error>> {
    try {
      const tipo = dados.tipo as TipoTarefa
      if (!['limpeza', 'manutencao', 'vistoria', 'entrega', 'inspecao'].includes(tipo)) {
        return Result.fail(new Error(`Tipo de tarefa inválido: ${dados.tipo}`))
      }

      let prioridade: Prioridade
      if (dados.prioridade) {
        const prioResult = Prioridade.criar(dados.prioridade)
        if (prioResult.isFail) return Result.fail(prioResult.error)
        prioridade = prioResult.value
      } else {
        prioridade = Prioridade.media()
      }

      if (dados.responsavelId && dados.tipoResponsavel === 'staff') {
        const staffResult = await this.staffPort.buscarStaffPorId(dados.responsavelId, dados.propriedadeId)
        if (staffResult.isFail) return Result.fail(staffResult.error)
        if (!staffResult.value) {
          return Result.fail(new Error('Staff não encontrado'))
        }
        if (!staffResult.value.podeReceberTarefa) {
          return Result.fail(new Error('Staff já possui 3 tarefas em andamento ou está inativo'))
        }
      }

      let dataLimite: Date | undefined
      const slaResult = await this.slaPort.buscarSla(tipo, prioridade)
      if (slaResult.isOk && slaResult.value) {
        dataLimite = slaResult.value.calcularDataLimite(new Date())
      }

      const tarefaResult = await this.tarefaPort.criarTarefa({
        tipo,
        propriedadeId: dados.propriedadeId,
        titulo: dados.titulo,
        descricao: dados.descricao,
        prioridade,
        responsavelId: dados.responsavelId,
        tipoResponsavel: dados.tipoResponsavel,
        ativoId: dados.ativoId,
        tipoAtivo: dados.tipoAtivo,
        dataLimite,
      })

      if (tarefaResult.isFail) return Result.fail(tarefaResult.error)

      if (dados.responsavelId && dados.tipoResponsavel === 'staff') {
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

      return tarefaResult
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao criar tarefa'))
    }
  }
}
