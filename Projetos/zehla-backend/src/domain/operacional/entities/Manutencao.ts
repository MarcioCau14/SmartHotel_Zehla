import { Result } from '../../../shared/Result'
import { Gravidade } from '../value-objects/Gravidade'

export type TipoManutencao = 'corretiva' | 'preventiva' | 'preditiva'
export type CategoriaManutencao = 'hidraulica' | 'eletrica' | 'estrutura' | 'climatizacao' | 'dedetizacao' | 'equipamento' | 'mobilia' | 'outro'
export type StatusManutencao = 'aberta' | 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'

const TIPOS_VALIDOS: TipoManutencao[] = ['corretiva', 'preventiva', 'preditiva']
const CATEGORIAS_VALIDAS: CategoriaManutencao[] = ['hidraulica', 'eletrica', 'estrutura', 'climatizacao', 'dedetizacao', 'equipamento', 'mobilia', 'outro']
const STATUS_VALIDOS: StatusManutencao[] = ['aberta', 'agendada', 'em_andamento', 'concluida', 'cancelada']

export class Manutencao {
  private _eventos: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(
    public readonly id: string,
    public readonly tarefaId: string,
    public readonly propriedadeId: string,
    public readonly dataAbertura: Date,
    public readonly tipo: TipoManutencao,
    public readonly gravidade: Gravidade,
    public readonly categoria: CategoriaManutencao,
    public readonly ativoId: string | undefined,
    public readonly tipoAtivo: string | undefined,
    public readonly descricaoProblema: string,
    public readonly descricaoSolucao: string | undefined,
    public readonly dataInicio: Date | undefined,
    public readonly dataFim: Date | undefined,
    public readonly fornecedorId: string | undefined,
    public readonly custoPecas: number | undefined,
    public readonly custoServico: number | undefined,
    public readonly status: StatusManutencao,
    public readonly interditaQuarto: boolean,
    public readonly requerAprovacaoHumana: boolean,
    eventos: Array<{ type: string; payload: Record<string, unknown> }> = [],
  ) {
    this._eventos = eventos
    Object.freeze(this)
  }

  static create(props: {
    id: string
    tarefaId: string
    propriedadeId: string
    dataAbertura: Date
    tipo: TipoManutencao
    gravidade: Gravidade
    categoria: CategoriaManutencao
    ativoId?: string
    tipoAtivo?: string
    descricaoProblema: string
    descricaoSolucao?: string
    dataInicio?: Date
    dataFim?: Date
    fornecedorId?: string
    custoPecas?: number
    custoServico?: number
    status?: StatusManutencao
    interditaQuarto?: boolean
    requerAprovacaoHumana?: boolean
  }): Result<Manutencao, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID da manutenção é obrigatório'))
    }
    if (!props.tarefaId || props.tarefaId.trim().length === 0) {
      return Result.fail(new Error('ID da tarefa vinculada é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.dataAbertura || !(props.dataAbertura instanceof Date) || isNaN(props.dataAbertura.getTime())) {
      return Result.fail(new Error('Data de abertura é obrigatória'))
    }
    if (!props.tipo || !TIPOS_VALIDOS.includes(props.tipo)) {
      return Result.fail(new Error(`Tipo de manutenção inválido: ${props.tipo}`))
    }
    if (!props.gravidade || !(props.gravidade instanceof Gravidade)) {
      return Result.fail(new Error('Gravidade é obrigatória'))
    }
    if (!props.categoria || !CATEGORIAS_VALIDAS.includes(props.categoria)) {
      return Result.fail(new Error(`Categoria de manutenção inválida: ${props.categoria}`))
    }
    if (!props.descricaoProblema || props.descricaoProblema.trim().length === 0) {
      return Result.fail(new Error('Descrição do problema é obrigatória'))
    }
    if (props.status && !STATUS_VALIDOS.includes(props.status)) {
      return Result.fail(new Error(`Status inválido: ${props.status}`))
    }

    if (props.gravidade.isSevera) {
      const preventiva = props.tipo === 'preventiva'
      if (preventiva) {
        return Result.fail(new Error('Manutenção preventiva não pode ter gravidade severa'))
      }
    }

    const interdita = props.gravidade.isSevera

    return Result.ok(new Manutencao(
      props.id.trim(),
      props.tarefaId.trim(),
      props.propriedadeId,
      props.dataAbertura,
      props.tipo,
      props.gravidade,
      props.categoria,
      props.ativoId?.trim() || undefined,
      props.tipoAtivo?.trim() || undefined,
      props.descricaoProblema.trim(),
      props.descricaoSolucao?.trim() || undefined,
      props.dataInicio || undefined,
      props.dataFim || undefined,
      props.fornecedorId?.trim() || undefined,
      props.custoPecas || undefined,
      props.custoServico || undefined,
      props.status || 'aberta',
      interdita,
      props.requerAprovacaoHumana || false,
    ))
  }

  iniciar(): Result<Manutencao, Error> {
    if (this.status !== 'aberta' && this.status !== 'agendada') {
      return Result.fail(new Error(`Manutenção não pode ser iniciada no status ${this.status}`))
    }

    const manutencao = new Manutencao(
      this.id, this.tarefaId, this.propriedadeId, this.dataAbertura,
      this.tipo, this.gravidade, this.categoria,
      this.ativoId, this.tipoAtivo, this.descricaoProblema, this.descricaoSolucao,
      new Date(), this.dataFim,
      this.fornecedorId, this.custoPecas, this.custoServico,
      'em_andamento', this.interditaQuarto, this.requerAprovacaoHumana,
      [{
        type: 'ManutencaoIniciadaEvent',
        payload: {
          manutencaoId: this.id,
          tarefaId: this.tarefaId,
          interditaQuarto: this.interditaQuarto || this.gravidade.isSevera,
          ativoId: this.ativoId,
          tipoAtivo: this.tipoAtivo,
          requerAprovacaoHumana: this.requerAprovacaoHumana,
        },
      }],
    )

    return Result.ok(manutencao)
  }

  concluir(descricaoSolucao: string, custoPecas?: number, custoServico?: number): Result<Manutencao, Error> {
    if (this.status !== 'em_andamento') {
      return Result.fail(new Error(`Manutenção não pode ser concluída no status ${this.status}`))
    }
    if (!descricaoSolucao || descricaoSolucao.trim().length === 0) {
      return Result.fail(new Error('Descrição da solução é obrigatória na conclusão'))
    }

    const manutencao = new Manutencao(
      this.id, this.tarefaId, this.propriedadeId, this.dataAbertura,
      this.tipo, this.gravidade, this.categoria,
      this.ativoId, this.tipoAtivo, this.descricaoProblema, descricaoSolucao.trim(),
      this.dataInicio, new Date(),
      this.fornecedorId, custoPecas || this.custoPecas, custoServico || this.custoServico,
      'concluida', this.interditaQuarto, this.requerAprovacaoHumana,
      [{
        type: 'ManutencaoConcluidaEvent',
        payload: {
          manutencaoId: this.id,
          tarefaId: this.tarefaId,
          estavaInterditado: this.interditaQuarto,
          ativoId: this.ativoId,
          tipoAtivo: this.tipoAtivo,
          dataFim: new Date().toISOString(),
        },
      }],
    )

    return Result.ok(manutencao)
  }

  agendar(dataInicio: Date): Result<Manutencao, Error> {
    if (this.status !== 'aberta') {
      return Result.fail(new Error(`Manutenção não pode ser agendada no status ${this.status}`))
    }
    if (!dataInicio || !(dataInicio instanceof Date) || isNaN(dataInicio.getTime())) {
      return Result.fail(new Error('Data de agendamento é obrigatória'))
    }

    const manutencao = new Manutencao(
      this.id, this.tarefaId, this.propriedadeId, this.dataAbertura,
      this.tipo, this.gravidade, this.categoria,
      this.ativoId, this.tipoAtivo, this.descricaoProblema, this.descricaoSolucao,
      this.dataInicio, this.dataFim,
      this.fornecedorId, this.custoPecas, this.custoServico,
      'agendada', this.interditaQuarto, this.requerAprovacaoHumana,
    )

    return Result.ok(manutencao)
  }

  cancelar(): Result<Manutencao, Error> {
    if (this.status === 'concluida' || this.status === 'cancelada') {
      return Result.fail(new Error(`Manutenção ${this.status} não pode ser cancelada`))
    }

    const manutencao = new Manutencao(
      this.id, this.tarefaId, this.propriedadeId, this.dataAbertura,
      this.tipo, this.gravidade, this.categoria,
      this.ativoId, this.tipoAtivo, this.descricaoProblema, this.descricaoSolucao,
      this.dataInicio, this.dataFim,
      this.fornecedorId, this.custoPecas, this.custoServico,
      'cancelada', this.interditaQuarto, this.requerAprovacaoHumana,
    )

    return Result.ok(manutencao)
  }

  get eventos(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._eventos]
  }

  get custoTotal(): number | undefined {
    if (this.custoPecas === undefined && this.custoServico === undefined) return undefined
    return (this.custoPecas || 0) + (this.custoServico || 0)
  }
}
