import { Result } from '../../../shared/Result'

export type TipoSazonalidade = 'alta' | 'media' | 'baixa' | 'feriado' | 'evento'

const TIPOS_SAZONALIDADE_VALIDOS: TipoSazonalidade[] = ['alta', 'media', 'baixa', 'feriado', 'evento']
const FERIADOS_NACIONAIS: Array<{ nome: string; mes: number; dia: number }> = [
  { nome: 'Confraternização Universal', mes: 1, dia: 1 },
  { nome: 'Carnaval', mes: 2, dia: 17 },
  { nome: 'Paixão de Cristo', mes: 4, dia: 3 },
  { nome: 'Tiradentes', mes: 4, dia: 21 },
  { nome: 'Dia do Trabalho', mes: 5, dia: 1 },
  { nome: 'Independência', mes: 9, dia: 7 },
  { nome: 'Nossa Senhora Aparecida', mes: 10, dia: 12 },
  { nome: 'Finados', mes: 11, dia: 2 },
  { nome: 'Proclamação da República', mes: 11, dia: 15 },
  { nome: 'Consciência Negra', mes: 11, dia: 20 },
  { nome: 'Natal', mes: 12, dia: 25 },
]

function isFeriadoNacional(data: Date): boolean {
  return FERIADOS_NACIONAIS.some(f => f.mes === data.getMonth() + 1 && f.dia === data.getDate())
}

export interface SazonalidadeProps {
  id: string
  propriedadeId: string
  nome: string
  tipo: string
  multiplicadorPreco: number
  dataInicio: Date
  dataFim: Date
  recorrente?: boolean
  diasMinimosEstadia?: number
  regrasEspeciais?: string[]
}

export class Sazonalidade {
  private _eventos: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(
    public readonly id: string,
    public readonly propriedadeId: string,
    public readonly nome: string,
    public readonly tipo: TipoSazonalidade,
    public readonly multiplicadorPreco: number,
    public readonly dataInicio: Date,
    public readonly dataFim: Date,
    public readonly recorrente: boolean,
    public readonly diasMinimosEstadia: number | undefined,
    public readonly regrasEspeciais: string[],
    eventos: Array<{ type: string; payload: Record<string, unknown> }> = [],
  ) {
    this._eventos = eventos
    Object.freeze(this)
  }

  static create(props: SazonalidadeProps): Result<Sazonalidade, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID da sazonalidade é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.nome || props.nome.trim().length === 0) {
      return Result.fail(new Error('Nome da sazonalidade é obrigatório'))
    }
    if (!props.tipo || !TIPOS_SAZONALIDADE_VALIDOS.includes(props.tipo as TipoSazonalidade)) {
      return Result.fail(new Error(`Tipo de sazonalidade inválido: ${props.tipo}`))
    }
    if (typeof props.multiplicadorPreco !== 'number' || props.multiplicadorPreco < 0.7) {
      return Result.fail(new Error('Multiplicador de preço mínimo é 0.7'))
    }
    if (!props.dataInicio || !(props.dataInicio instanceof Date) || isNaN(props.dataInicio.getTime())) {
      return Result.fail(new Error('Data início é obrigatória'))
    }
    if (!props.dataFim || !(props.dataFim instanceof Date) || isNaN(props.dataFim.getTime())) {
      return Result.fail(new Error('Data fim é obrigatória'))
    }
    if (props.dataFim <= props.dataInicio) {
      return Result.fail(new Error('Data fim deve ser posterior à data início'))
    }
    if (props.diasMinimosEstadia !== undefined && props.diasMinimosEstadia < 1) {
      return Result.fail(new Error('Dias mínimos de estadia deve ser no mínimo 1'))
    }

    const tipo = props.tipo as TipoSazonalidade

    const inicioFeriado = isFeriadoNacional(props.dataInicio)
    const fimFeriado = isFeriadoNacional(props.dataFim)

    if (tipo !== 'feriado' && (inicioFeriado || fimFeriado)) {
      return Result.fail(new Error('Período com feriado nacional deve ser classificado como feriado'))
    }

    const eventos: Array<{ type: string; payload: Record<string, unknown> }> = [
      {
        type: 'SazonalidadeCriadaEvent',
        payload: {
          sazonalidadeId: props.id.trim(),
          nome: props.nome.trim(),
          tipo,
          multiplicador: props.multiplicadorPreco,
          dataInicio: props.dataInicio.toISOString(),
          dataFim: props.dataFim.toISOString(),
          propriedadeId: props.propriedadeId,
        },
      },
    ]

    return Result.ok(new Sazonalidade(
      props.id.trim(),
      props.propriedadeId,
      props.nome.trim(),
      tipo,
      props.multiplicadorPreco,
      props.dataInicio,
      props.dataFim,
      props.recorrente ?? false,
      props.diasMinimosEstadia,
      props.regrasEspeciais || [],
      eventos,
    ))
  }

  get eventos(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._eventos]
  }
}
