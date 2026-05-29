import { Result } from '../../../shared/Result'
import { IChecklistPort } from '../ports/IChecklistPort'
import { Checklist, ItemChecklist } from '../../../domain/operacional/entities/Checklist'

export class ExecutarChecklistUseCase {
  constructor(
    private readonly checklistPort: IChecklistPort,
  ) {}

  async execute(dados: {
    checklistId: string
    propriedadeId: string
    acao: 'iniciar' | 'concluir_item' | 'concluir'
    itemId?: string
  }): Promise<Result<Checklist, Error>> {
    try {
      const checklistResult = await this.checklistPort.buscarChecklistPorId(dados.checklistId, dados.propriedadeId)
      if (checklistResult.isFail) return Result.fail(checklistResult.error)
      if (!checklistResult.value) {
        return Result.fail(new Error('Checklist não encontrado'))
      }

      let checklist = checklistResult.value
      let checklistAtualizada: Result<Checklist, Error>

      if (dados.acao === 'iniciar') {
        const iniciada = checklist.iniciar()
        if (iniciada.isFail) return Result.fail(iniciada.error)
        checklistAtualizada = await this.checklistPort.atualizarChecklist(dados.checklistId, dados.propriedadeId, {
          status: 'em_andamento',
        })
      } else if (dados.acao === 'concluir_item') {
        if (!dados.itemId) {
          return Result.fail(new Error('ID do item é obrigatório para concluir_item'))
        }
        const itemConcluido = checklist.concluirItem(dados.itemId)
        if (itemConcluido.isFail) return Result.fail(itemConcluido.error)
        checklistAtualizada = await this.checklistPort.atualizarChecklist(dados.checklistId, dados.propriedadeId, {
          itens: itemConcluido.value.itens,
        })
      } else if (dados.acao === 'concluir') {
        const concluida = checklist.concluir()
        if (concluida.isFail) return Result.fail(concluida.error)
        checklistAtualizada = await this.checklistPort.atualizarChecklist(dados.checklistId, dados.propriedadeId, {
          status: 'concluido',
          dataConclusao: new Date(),
        })
      } else {
        return Result.fail(new Error(`Ação inválida: ${dados.acao}`))
      }

      if (checklistAtualizada.isFail) return Result.fail(checklistAtualizada.error)
      return Result.ok(checklistAtualizada.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao executar checklist'))
    }
  }
}
