import { Result } from '../../../shared/Result'

export type CargoStaff = 'camareira' | 'recepcionista' | 'tecnico' | 'gerente' | 'auxiliar_servicos_gerais'
export type TurnoStaff = 'matutino' | 'vespertino' | 'noturno' | 'integral'

const CARGOS_VALIDOS: CargoStaff[] = ['camareira', 'recepcionista', 'tecnico', 'gerente', 'auxiliar_servicos_gerais']
const TURNOS_VALIDOS: TurnoStaff[] = ['matutino', 'vespertino', 'noturno', 'integral']

export class Staff {
  private constructor(
    public readonly id: string,
    public readonly propriedadeId: string,
    public readonly dataContratacao: Date,
    public readonly nome: string,
    public readonly email: string | undefined,
    public readonly telefone: string | undefined,
    public readonly cargo: CargoStaff,
    public readonly turno: TurnoStaff,
    public readonly ativo: boolean,
    public readonly habilidades: string[],
    public readonly cargaHorariaSemanal: number,
    public readonly tarefasEmAndamento: number,
  ) {
    Object.freeze(this)
  }

  static create(props: {
    id: string
    propriedadeId: string
    dataContratacao: Date
    nome: string
    email?: string
    telefone?: string
    cargo: string
    turno: string
    ativo?: boolean
    habilidades?: string[]
    cargaHorariaSemanal?: number
    tarefasEmAndamento?: number
  }): Result<Staff, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID do staff é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.dataContratacao || !(props.dataContratacao instanceof Date) || isNaN(props.dataContratacao.getTime())) {
      return Result.fail(new Error('Data de contratação é obrigatória'))
    }
    if (!props.nome || props.nome.trim().length === 0) {
      return Result.fail(new Error('Nome do staff é obrigatório'))
    }
    if (!props.cargo || !CARGOS_VALIDOS.includes(props.cargo as CargoStaff)) {
      return Result.fail(new Error(`Cargo inválido: ${props.cargo}`))
    }
    if (!props.turno || !TURNOS_VALIDOS.includes(props.turno as TurnoStaff)) {
      return Result.fail(new Error(`Turno inválido: ${props.turno}`))
    }

    const cargo = props.cargo as CargoStaff
    const turno = props.turno as TurnoStaff
    const habilidades = props.habilidades || []
    const cargaHoraria = props.cargaHorariaSemanal || 44

    if (cargaHoraria < 0 || cargaHoraria > 44) {
      return Result.fail(new Error('Carga horária semanal deve estar entre 0 e 44 horas'))
    }
    if (props.tarefasEmAndamento !== undefined && (props.tarefasEmAndamento < 0 || props.tarefasEmAndamento > 3)) {
      return Result.fail(new Error('Tarefas em andamento deve estar entre 0 e 3'))
    }
    if (cargo === 'tecnico' && habilidades.length === 0) {
      return Result.fail(new Error('Staff com cargo técnico deve ter ao menos uma habilidade'))
    }

    return Result.ok(new Staff(
      props.id.trim(),
      props.propriedadeId,
      props.dataContratacao,
      props.nome.trim(),
      props.email?.trim() || undefined,
      props.telefone?.trim() || undefined,
      cargo,
      turno,
      props.ativo !== undefined ? props.ativo : true,
      habilidades,
      cargaHoraria,
      props.tarefasEmAndamento || 0,
    ))
  }

  get podeReceberTarefa(): boolean {
    return this.ativo && this.tarefasEmAndamento < 3
  }

  get estaDisponivel(): boolean {
    return this.ativo && this.tarefasEmAndamento < 3
  }

  incrementarTarefas(): Result<Staff, Error> {
    if (!this.ativo) {
      return Result.fail(new Error('Staff inativo não pode receber tarefas'))
    }
    if (this.tarefasEmAndamento >= 3) {
      return Result.fail(new Error('Staff já possui 3 tarefas em andamento'))
    }

    return Result.ok(new Staff(
      this.id, this.propriedadeId, this.dataContratacao, this.nome, this.email, this.telefone,
      this.cargo, this.turno, this.ativo, this.habilidades, this.cargaHorariaSemanal,
      this.tarefasEmAndamento + 1,
    ))
  }

  decrementarTarefas(): Result<Staff, Error> {
    if (this.tarefasEmAndamento <= 0) {
      return Result.ok(this as Staff)
    }

    return Result.ok(new Staff(
      this.id, this.propriedadeId, this.dataContratacao, this.nome, this.email, this.telefone,
      this.cargo, this.turno, this.ativo, this.habilidades, this.cargaHorariaSemanal,
      this.tarefasEmAndamento - 1,
    ))
  }

  ativar(): Staff {
    return new Staff(
      this.id, this.propriedadeId, this.dataContratacao, this.nome, this.email, this.telefone,
      this.cargo, this.turno, true, this.habilidades, this.cargaHorariaSemanal,
      this.tarefasEmAndamento,
    )
  }

  desativar(): Result<Staff, Error> {
    if (this.tarefasEmAndamento > 0) {
      return Result.fail(new Error('Staff com tarefas em andamento não pode ser desativado'))
    }
    return Result.ok(new Staff(
      this.id, this.propriedadeId, this.dataContratacao, this.nome, this.email, this.telefone,
      this.cargo, this.turno, false, this.habilidades, this.cargaHorariaSemanal,
      this.tarefasEmAndamento,
    ))
  }

  temHabilidade(habilidade: string): boolean {
    return this.habilidades.some(h => h.toLowerCase() === habilidade.toLowerCase())
  }
}
