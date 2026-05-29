import { Result } from '../../../shared/Result'
import { IChecklistPort } from '../../../application/operacional/ports/IChecklistPort'
import { Checklist, TipoTriggerChecklist, ItemChecklist } from '../../../domain/operacional/entities/Checklist'

export class ChecklistInMemoryRepository implements IChecklistPort {
  private checklists: Map<string, Checklist> = new Map()

  async criarChecklist(dados: {
    propriedadeId: string
    nome: string
    tipoTrigger: string
    ativoId?: string
    itens: ItemChecklist[]
    responsavelId?: string
  }): Promise<Result<Checklist, Error>> {
    const checklistResult = Checklist.create({
      id: `checklist_${this.checklists.size + 1}_${Date.now()}`,
      propriedadeId: dados.propriedadeId,
      nome: dados.nome,
      tipoTrigger: dados.tipoTrigger,
      ativoId: dados.ativoId,
      itens: dados.itens,
      responsavelId: dados.responsavelId,
      dataCriacao: new Date(),
    })
    if (checklistResult.isFail) return checklistResult
    this.checklists.set(checklistResult.value.id, checklistResult.value)
    return Result.ok(checklistResult.value)
  }

  async buscarChecklistPorId(id: string, propriedadeId: string): Promise<Result<Checklist | null, Error>> {
    const checklist = this.checklists.get(id)
    if (!checklist || checklist.propriedadeId !== propriedadeId) return Result.ok(null)
    return Result.ok(checklist)
  }

  async listarPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Checklist[], Error>> {
    const lista = Array.from(this.checklists.values()).filter(
      c => c.propriedadeId === propriedadeId && c.ativoId === ativoId,
    )
    return Result.ok(lista)
  }

  async listarPorTrigger(tipoTrigger: TipoTriggerChecklist, propriedadeId: string): Promise<Result<Checklist[], Error>> {
    const lista = Array.from(this.checklists.values()).filter(
      c => c.propriedadeId === propriedadeId && c.tipoTrigger === tipoTrigger,
    )
    return Result.ok(lista)
  }

  async listarPendentesPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Checklist[], Error>> {
    const lista = Array.from(this.checklists.values()).filter(
      c => c.propriedadeId === propriedadeId && c.ativoId === ativoId &&
        (c.status === 'pendente' || c.status === 'em_andamento'),
    )
    return Result.ok(lista)
  }

  async atualizarChecklist(id: string, propriedadeId: string, dados: {
    status?: string
    itens?: ItemChecklist[]
    dataConclusao?: Date
  }): Promise<Result<Checklist, Error>> {
    const checklist = this.checklists.get(id)
    if (!checklist || checklist.propriedadeId !== propriedadeId) {
      return Result.fail(new Error('Checklist não encontrado'))
    }

    const atualizadoResult = Checklist.create({
      id: checklist.id,
      propriedadeId: checklist.propriedadeId,
      nome: checklist.nome,
      tipoTrigger: checklist.tipoTrigger,
      ativoId: checklist.ativoId,
      itens: dados.itens || checklist.itens,
      status: dados.status || checklist.status,
      responsavelId: checklist.responsavelId,
      dataCriacao: checklist.dataCriacao,
      dataConclusao: dados.dataConclusao || checklist.dataConclusao,
    })
    if (atualizadoResult.isFail) return atualizadoResult
    this.checklists.set(id, atualizadoResult.value)
    return Result.ok(atualizadoResult.value)
  }
}
