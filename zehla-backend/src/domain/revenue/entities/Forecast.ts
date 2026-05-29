import { Result } from '../../../shared/Result'
import { Money } from '../../comercial/value-objects/Money'

export type HorizonteForecast = 7 | 30 | 90

const LIMITES_CONFIANCA: Record<HorizonteForecast, number> = {
  7: 0.95,
  30: 0.85,
  90: 0.70,
}

export interface PrevisaoDiaria {
  dia: number
  ocupacao: number
  receita: number
  adr: number
  revpar: number
}

export interface ForecastProps {
  id: string
  propriedadeId: string
  horizonte: number
  previsaoOcupacao: number[]
  previsaoReceita: number[]
  previsaoADR: number[]
  previsaoRevPAR: number[]
  confiancaMedia: number
  variancia: number
  dadosHistoricoInicio: Date
  dadosHistoricoFim: Date
  assinaturaModelo: string
  dataGeracao?: Date
}

export class Forecast {
  private _eventos: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(
    public readonly id: string,
    public readonly propriedadeId: string,
    public readonly horizonte: HorizonteForecast,
    public readonly previsaoOcupacao: number[],
    public readonly previsaoReceita: number[],
    public readonly previsaoADR: number[],
    public readonly previsaoRevPAR: number[],
    public readonly confiancaMedia: number,
    public readonly variancia: number,
    public readonly dadosHistoricoInicio: Date,
    public readonly dadosHistoricoFim: Date,
    public readonly assinaturaModelo: string,
    public readonly dataGeracao: Date,
    eventos: Array<{ type: string; payload: Record<string, unknown> }> = [],
  ) {
    this._eventos = eventos
    Object.freeze(this)
  }

  static create(props: ForecastProps): Result<Forecast, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID do forecast é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }

    if (![7, 30, 90].includes(props.horizonte)) {
      return Result.fail(new Error('Horizonte deve ser 7, 30 ou 90 dias'))
    }
    const horizonte = props.horizonte as HorizonteForecast

    if (props.previsaoOcupacao.length !== horizonte) {
      return Result.fail(new Error(`Previsão de ocupação deve ter exatamente ${horizonte} dias`))
    }
    if (props.previsaoReceita.length !== horizonte) {
      return Result.fail(new Error(`Previsão de receita deve ter exatamente ${horizonte} dias`))
    }
    if (props.previsaoADR.length !== horizonte) {
      return Result.fail(new Error(`Previsão de ADR deve ter exatamente ${horizonte} dias`))
    }
    if (props.previsaoRevPAR.length !== horizonte) {
      return Result.fail(new Error(`Previsão de RevPAR deve ter exatamente ${horizonte} dias`))
    }

    for (const ocup of props.previsaoOcupacao) {
      if (ocup < 0 || ocup > 100) {
        return Result.fail(new Error('Previsão de ocupação deve estar entre 0 e 100'))
      }
    }

    for (const rec of props.previsaoReceita) {
      if (rec < 0) {
        return Result.fail(new Error('Previsão de receita não pode ser negativa'))
      }
    }

    if (typeof props.confiancaMedia !== 'number' || props.confiancaMedia < 0 || props.confiancaMedia > 1) {
      return Result.fail(new Error('Confiança média deve estar entre 0 e 1'))
    }

    const limiteConfianca = LIMITES_CONFIANCA[horizonte]
    if (props.confiancaMedia > limiteConfianca) {
      return Result.fail(new Error(`Confiança máxima para horizonte ${horizonte}d é ${limiteConfianca}`))
    }

    if (typeof props.variancia !== 'number' || props.variancia < 0) {
      return Result.fail(new Error('Variância não pode ser negativa'))
    }
    if (!props.dadosHistoricoInicio || !(props.dadosHistoricoInicio instanceof Date) || isNaN(props.dadosHistoricoInicio.getTime())) {
      return Result.fail(new Error('Data início do histórico é obrigatória'))
    }
    if (!props.dadosHistoricoFim || !(props.dadosHistoricoFim instanceof Date) || isNaN(props.dadosHistoricoFim.getTime())) {
      return Result.fail(new Error('Data fim do histórico é obrigatória'))
    }
    if (props.dadosHistoricoFim <= props.dadosHistoricoInicio) {
      return Result.fail(new Error('Data fim do histórico deve ser posterior à data início'))
    }
    if (!props.assinaturaModelo || props.assinaturaModelo.trim().length === 0) {
      return Result.fail(new Error('Assinatura do modelo é obrigatória'))
    }

    const totalReceitaCentavos = props.previsaoReceita.reduce((acc, r) => acc + r, 0)
    const receitaTotal = Math.round(totalReceitaCentavos)

    const eventos: Array<{ type: string; payload: Record<string, unknown> }> = [
      {
        type: 'ForecastGeradoEvent',
        payload: {
          forecastId: props.id.trim(),
          propriedadeId: props.propriedadeId,
          horizonte,
          confiancaMedia: props.confiancaMedia,
          receitaProjetada: receitaTotal,
          assinaturaModelo: props.assinaturaModelo,
          dataGeracao: (props.dataGeracao || new Date()).toISOString(),
        },
      },
    ]

    return Result.ok(new Forecast(
      props.id.trim(),
      props.propriedadeId,
      horizonte,
      props.previsaoOcupacao,
      props.previsaoReceita,
      props.previsaoADR,
      props.previsaoRevPAR,
      props.confiancaMedia,
      props.variancia,
      props.dadosHistoricoInicio,
      props.dadosHistoricoFim,
      props.assinaturaModelo.trim(),
      props.dataGeracao || new Date(),
      eventos,
    ))
  }

  get receitaProjetadaTotal(): Money {
    const totalCentavos = this.previsaoReceita.reduce((acc, r) => acc + r, 0)
    const result = Money.criar(Math.round(totalCentavos))
    if (result.isFail) return Money.zero()
    return result.value
  }

  get eventos(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._eventos]
  }
}
