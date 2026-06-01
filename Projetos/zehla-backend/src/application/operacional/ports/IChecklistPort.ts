import { Result } from '../../../shared/Result'
import { Checklist, TipoTriggerChecklist, ItemChecklist } from '../../../domain/operacional/entities/Checklist'

export interface IChecklistPort {
  criarChecklist(dados: {
    propriedadeId: string
    nome: string
    tipoTrigger: string
    ativoId?: string
    itens: ItemChecklist[]
    responsavelId?: string
  }): Promise<Result<Checklist, Error>>

  buscarChecklistPorId(id: string, propriedadeId: string): Promise<Result<Checklist | null, Error>>

  listarPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Checklist[], Error>>

  listarPorTrigger(tipoTrigger: TipoTriggerChecklist, propriedadeId: string): Promise<Result<Checklist[], Error>>

  listarPendentesPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Checklist[], Error>>

  atualizarChecklist(id: string, propriedadeId: string, dados: {
    status?: string
    itens?: ItemChecklist[]
    dataConclusao?: Date
  }): Promise<Result<Checklist, Error>>
}
