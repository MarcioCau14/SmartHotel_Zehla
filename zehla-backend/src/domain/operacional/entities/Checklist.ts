import { Result } from '../../../shared/Result'

export type TipoTriggerChecklist = 'checkout' | 'checkin' | 'diario' | 'semanal' | 'pre_entrega' | 'manutencao'
export type StatusChecklist = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'

const TRIGGERS_VALIDOS: TipoTriggerChecklist[] = ['checkout', 'checkin', 'diario', 'semanal', 'pre_entrega', 'manutencao']
const STATUS_VALIDOS: StatusChecklist[] = ['pendente', 'em_andamento', 'concluido', 'cancelado']

export interface ItemChecklist {
  itemId: string
  descricao: string
  obrigatorio: boolean
  concluido: boolean
}

export class Checklist {
  private _eventos: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(
    public readonly id: string,
    public readonly propriedadeId: string,
    public readonly nome: string,
    public readonly tipoTrigger: TipoTriggerChecklist,
    public readonly ativoId: string | undefined,
    public readonly itens: ItemChecklist[],
    public readonly status: StatusChecklist,
    public readonly responsavelId: string | undefined,
    public readonly dataCriacao: Date,
    public readonly dataConclusao: Date | undefined,
    eventos: Array<{ type: string; payload: Record<string, unknown> }> = [],
  ) {
    this._eventos = eventos
    Object.freeze(this)
  }

  static create(props: {
    id: string
    propriedadeId: string
    nome: string
    tipoTrigger: string
    ativoId?: string
    itens: ItemChecklist[]
    status?: string
    responsavelId?: string
    dataCriacao: Date
    dataConclusao?: Date
  }): Result<Checklist, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID do checklist é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.nome || props.nome.trim().length === 0) {
      return Result.fail(new Error('Nome do checklist é obrigatório'))
    }
    if (!props.tipoTrigger || !TRIGGERS_VALIDOS.includes(props.tipoTrigger as TipoTriggerChecklist)) {
      return Result.fail(new Error(`Tipo de trigger inválido: ${props.tipoTrigger}`))
    }
    if (!props.itens || props.itens.length === 0) {
      return Result.fail(new Error('Checklist deve ter ao menos um item'))
    }
    if (!props.dataCriacao || !(props.dataCriacao instanceof Date) || isNaN(props.dataCriacao.getTime())) {
      return Result.fail(new Error('Data de criação é obrigatória'))
    }

    const trigger = props.tipoTrigger as TipoTriggerChecklist
    const status = (props.status as StatusChecklist) || 'pendente'
    if (!STATUS_VALIDOS.includes(status)) {
      return Result.fail(new Error(`Status inválido: ${props.status}`))
    }

    if (props.dataConclusao && status !== 'concluido') {
      return Result.fail(new Error('Data de conclusão só pode ser definida no status concluido'))
    }

    return Result.ok(new Checklist(
      props.id.trim(),
      props.propriedadeId,
      props.nome.trim(),
      trigger,
      props.ativoId?.trim() || undefined,
      props.itens.map(item => ({ ...item, concluido: item.concluido || false })),
      status,
      props.responsavelId?.trim() || undefined,
      props.dataCriacao,
      props.dataConclusao || undefined,
    ))
  }

  get itensObrigatoriosPendentes(): ItemChecklist[] {
    return this.itens.filter(i => i.obrigatorio && !i.concluido)
  }

  get estaConcluido(): boolean {
    return this.status === 'concluido'
  }

  get todosObrigatoriosConcluidos(): boolean {
    return this.itensObrigatoriosPendentes.length === 0
  }

  iniciar(): Result<Checklist, Error> {
    if (this.status !== 'pendente') {
      return Result.fail(new Error(`Checklist não pode ser iniciado no status ${this.status}`))
    }

    return Result.ok(new Checklist(
      this.id, this.propriedadeId, this.nome, this.tipoTrigger, this.ativoId,
      this.itens, 'em_andamento', this.responsavelId, this.dataCriacao, undefined,
    ))
  }

  concluirItem(itemId: string): Result<Checklist, Error> {
    if (this.status === 'concluido' || this.status === 'cancelado') {
      return Result.fail(new Error(`Checklist ${this.status} não pode ser modificado`))
    }

    const itemIndex = this.itens.findIndex(i => i.itemId === itemId)
    if (itemIndex === -1) {
      return Result.fail(new Error(`Item ${itemId} não encontrado no checklist`))
    }

    const novosItens = this.itens.map((item, idx) =>
      idx === itemIndex ? { ...item, concluido: true } : item,
    )

    return Result.ok(new Checklist(
      this.id, this.propriedadeId, this.nome, this.tipoTrigger, this.ativoId,
      novosItens, this.status, this.responsavelId, this.dataCriacao, this.dataConclusao,
    ))
  }

  concluir(): Result<Checklist, Error> {
    if (this.status !== 'em_andamento') {
      return Result.fail(new Error(`Checklist não pode ser concluído no status ${this.status}`))
    }

    if (!this.todosObrigatoriosConcluidos) {
      return Result.fail(new Error('Todos os itens obrigatórios devem ser concluídos'))
    }

    const checklist = new Checklist(
      this.id, this.propriedadeId, this.nome, this.tipoTrigger, this.ativoId,
      this.itens, 'concluido', this.responsavelId, this.dataCriacao, new Date(),
      [{
        type: 'ChecklistConcluidoEvent',
        payload: {
          checklistId: this.id,
          tipoTrigger: this.tipoTrigger,
          ativoId: this.ativoId,
          dataConclusao: new Date().toISOString(),
        },
      }],
    )

    return Result.ok(checklist)
  }

  cancelar(): Result<Checklist, Error> {
    if (this.status === 'concluido' || this.status === 'cancelado') {
      return Result.fail(new Error(`Checklist ${this.status} não pode ser cancelado`))
    }

    return Result.ok(new Checklist(
      this.id, this.propriedadeId, this.nome, this.tipoTrigger, this.ativoId,
      this.itens, 'cancelado', this.responsavelId, this.dataCriacao, this.dataConclusao,
    ))
  }

  get eventos(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._eventos]
  }
}
