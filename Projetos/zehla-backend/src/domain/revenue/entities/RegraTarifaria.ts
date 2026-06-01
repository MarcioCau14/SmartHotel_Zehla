import { Result } from '../../../shared/Result'
import { Money } from '../../comercial/value-objects/Money'
import { BreakEvenPoint } from '../value-objects/BreakEvenPoint'

export type TipoQuarto = 'suite' | 'standard' | 'luxo' | 'familiar'
export type TipoTarifa = 'dinamica' | 'promocional' | 'convenio'
export type CanalDistribuicao = 'direto' | 'booking' | 'airbnb' | 'expedia'
export type RegraReajuste = 'percentual' | 'manual'

const TIPOS_QUARTO_VALIDOS: TipoQuarto[] = ['suite', 'standard', 'luxo', 'familiar']
const TIPOS_TARIFA_VALIDOS: TipoTarifa[] = ['dinamica', 'promocional', 'convenio']
const CANAIS_VALIDOS: CanalDistribuicao[] = ['direto', 'booking', 'airbnb', 'expedia']
const REGRAS_REAJUSTE_VALIDAS: RegraReajuste[] = ['percentual', 'manual']
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

export interface RegraTarifariaProps {
  id: string
  propriedadeId: string
  tipoQuarto: string
  tipo: string
  valorDiaria: Money
  breakEvenPoint: BreakEvenPoint
  canal: string
  dataInicio: Date
  dataFim: Date
  valorAnterior?: Money | null
  regraReajuste: string
  parametrosReajuste: { percentualMax: number; gatilhoOcupacao: number }
  dataCriacao?: Date
}

export class RegraTarifaria {
  private _eventos: Array<{ type: string; payload: Record<string, unknown> }>

  private constructor(
    public readonly id: string,
    public readonly propriedadeId: string,
    public readonly tipoQuarto: TipoQuarto,
    public readonly tipo: TipoTarifa,
    public readonly valorDiaria: Money,
    public readonly breakEvenPoint: BreakEvenPoint,
    public readonly canal: CanalDistribuicao,
    public readonly dataInicio: Date,
    public readonly dataFim: Date,
    public readonly valorAnterior: Money | null,
    public readonly regraReajuste: RegraReajuste,
    public readonly parametrosReajuste: { percentualMax: number; gatilhoOcupacao: number },
    public readonly dataCriacao: Date,
    eventos: Array<{ type: string; payload: Record<string, unknown> }> = [],
  ) {
    this._eventos = eventos
    Object.freeze(this)
  }

  static create(props: RegraTarifariaProps): Result<RegraTarifaria, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID da regra tarifária é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!props.tipoQuarto || !TIPOS_QUARTO_VALIDOS.includes(props.tipoQuarto as TipoQuarto)) {
      return Result.fail(new Error(`Tipo de quarto inválido: ${props.tipoQuarto}`))
    }
    if (!props.tipo || !TIPOS_TARIFA_VALIDOS.includes(props.tipo as TipoTarifa)) {
      return Result.fail(new Error(`Tipo de tarifa inválido: ${props.tipo}`))
    }
    if (!props.valorDiaria || !(props.valorDiaria instanceof Money)) {
      return Result.fail(new Error('Valor da diária é obrigatório'))
    }
    if (!props.breakEvenPoint || !(props.breakEvenPoint instanceof BreakEvenPoint)) {
      return Result.fail(new Error('Break-even point é obrigatório'))
    }
    if (!props.canal || !CANAIS_VALIDOS.includes(props.canal as CanalDistribuicao)) {
      return Result.fail(new Error(`Canal de distribuição inválido: ${props.canal}`))
    }
    if (!props.regraReajuste || !REGRAS_REAJUSTE_VALIDAS.includes(props.regraReajuste as RegraReajuste)) {
      return Result.fail(new Error(`Regra de reajuste inválida: ${props.regraReajuste}`))
    }
    if (!props.dataFim || props.dataFim <= props.dataInicio) {
      return Result.fail(new Error('Data fim deve ser posterior à data início'))
    }

    const tipo = props.tipo as TipoTarifa
    const canal = props.canal as CanalDistribuicao

    const isDataFeriado = isFeriadoNacional(props.dataFim)
    if (isDataFeriado && tipo !== 'promocional') {
      return Result.fail(new Error('Período de feriado nacional exige tarifa promocional'))
    }

    if (!props.breakEvenPoint.estaCobertoPor(props.valorDiaria)) {
      return Result.fail(new Error('Valor da diária não pode ser inferior ao break-even point'))
    }

    if (tipo === 'promocional' && props.parametrosReajuste.percentualMax > 0) {
      return Result.fail(new Error('Tarifa promocional não pode ter parâmetros de reajuste dinâmico'))
    }

    if (props.parametrosReajuste.percentualMax > 20) {
      return Result.fail(new Error('Percentual máximo de reajuste não pode exceder 20%'))
    }

    if (props.valorAnterior) {
      const delta = Math.abs(props.valorDiaria.centavos - props.valorAnterior.centavos) / props.valorAnterior.centavos
      if (delta > 0.20) {
        return Result.fail(new Error('Variação máxima de 20% em relação ao valor anterior excedida'))
      }
    }

    const eventos: Array<{ type: string; payload: Record<string, unknown> }> = [
      {
        type: tipo === 'promocional' ? 'TarifaPromocionalCriadaEvent' : 'TarifaAtualizadaEvent',
        payload: {
          regraId: props.id.trim(),
          tipoQuarto: props.tipoQuarto,
          tipo: props.tipo,
          valor: props.valorDiaria.centavos,
          canal: props.canal,
          propriedadeId: props.propriedadeId,
        },
      },
    ]

    return Result.ok(new RegraTarifaria(
      props.id.trim(),
      props.propriedadeId,
      props.tipoQuarto as TipoQuarto,
      tipo,
      props.valorDiaria,
      props.breakEvenPoint,
      canal,
      props.dataInicio,
      props.dataFim,
      props.valorAnterior || null,
      props.regraReajuste as RegraReajuste,
      props.parametrosReajuste,
      props.dataCriacao || new Date(),
      eventos,
    ))
  }

  atualizarValorDiaria(novoValor: Money): Result<RegraTarifaria, Error> {
    if (this.tipo === 'promocional') {
      return Result.fail(new Error('Tarifa promocional não pode ser alterada pelo Zé-Analyst'))
    }

    const isFeriado = isFeriadoNacional(this.dataFim)
    if (isFeriado) {
      return Result.fail(new Error('Tarifa de feriado não pode ser alterada pelo Zé-Analyst'))
    }

    if (!this.breakEvenPoint.estaCobertoPor(novoValor)) {
      return Result.fail(new Error('Novo valor viola o break-even point'))
    }

    const delta = Math.abs(novoValor.centavos - this.valorDiaria.centavos) / this.valorDiaria.centavos
    if (delta > 0.20) {
      return Result.fail(new Error('Variação máxima de 20% excedida'))
    }

    const breakEvenRatio = novoValor.centavos / this.breakEvenPoint.valor.centavos
    const eventos: Array<{ type: string; payload: Record<string, unknown> }> = [
      {
        type: 'TarifaAtualizadaEvent',
        payload: {
          regraId: this.id,
          valorAnterior: this.valorDiaria.centavos,
          valorNovo: novoValor.centavos,
          delta: Math.round(delta * 100),
          propriedadeId: this.propriedadeId,
        },
      },
    ]

    if (breakEvenRatio <= 1.10) {
      eventos.push({
        type: 'BreakEvenAtingidoEvent',
        payload: {
          regraId: this.id,
          valorDiaria: novoValor.centavos,
          breakEven: this.breakEvenPoint.valor.centavos,
          margem: Math.round((breakEvenRatio - 1) * 100),
          propriedadeId: this.propriedadeId,
        },
      })
    }

    return Result.ok(new RegraTarifaria(
      this.id, this.propriedadeId, this.tipoQuarto, this.tipo,
      novoValor, this.breakEvenPoint, this.canal,
      this.dataInicio, this.dataFim, this.valorDiaria,
      this.regraReajuste, this.parametrosReajuste, this.dataCriacao,
      eventos,
    ))
  }

  validarParidadeTarifaria(menorValorOTA: Money): Result<boolean, Error> {
    if (this.canal !== 'direto') {
      return Result.ok(true)
    }
    if (menorValorOTA.centavos <= 0) {
      return Result.fail(new Error('Valor da OTA para paridade deve ser positivo'))
    }
    const diferenca = Math.abs(this.valorDiaria.centavos - menorValorOTA.centavos)
    const razao = diferenca / menorValorOTA.centavos
    if (razao > 0.10) {
      return Result.fail(new Error('Tarifa do canal direto viola paridade contratual com OTAs (máx 10% de diferença)'))
    }
    return Result.ok(true)
  }

  get eventos(): Array<{ type: string; payload: Record<string, unknown> }> {
    return [...this._eventos]
  }
}
