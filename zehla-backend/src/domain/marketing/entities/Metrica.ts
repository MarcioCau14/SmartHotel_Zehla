import { Result } from '../../../shared/Result'

export interface MetricaProps {
  id: string
  propriedadeId: string
  dataInicio: Date
  dataFim: Date
  notaMedia?: number | null
  taxaResposta?: number | null
  sentimentoMedio?: number | null
  totalReviews?: number
  totalRespondidos?: number
  totalCampanhas?: number
  dataCriacao?: Date
}

export class Metrica {
  public readonly id: string
  public readonly propriedadeId: string
  public readonly dataInicio: Date
  public readonly dataFim: Date
  public readonly notaMedia: number | null
  public readonly taxaResposta: number | null
  public readonly sentimentoMedio: number | null
  public readonly totalReviews: number
  public readonly totalRespondidos: number
  public readonly totalCampanhas: number
  public readonly dataCriacao: Date

  private constructor(props: MetricaProps) {
    this.id = props.id
    this.propriedadeId = props.propriedadeId
    this.dataInicio = props.dataInicio
    this.dataFim = props.dataFim
    this.notaMedia = props.notaMedia ?? null
    this.taxaResposta = props.taxaResposta ?? null
    this.sentimentoMedio = props.sentimentoMedio ?? null
    this.totalReviews = props.totalReviews ?? 0
    this.totalRespondidos = props.totalRespondidos ?? 0
    this.totalCampanhas = props.totalCampanhas ?? 0
    this.dataCriacao = props.dataCriacao ?? new Date()
    Object.freeze(this)
  }

  static create(props: MetricaProps): Result<Metrica, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID da métrica é obrigatório'))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
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
    if (props.sentimentoMedio !== null && props.sentimentoMedio !== undefined) {
      if (props.sentimentoMedio < 0 || props.sentimentoMedio > 100) {
        return Result.fail(new Error('Sentimento médio deve estar entre 0 e 100'))
      }
    }
    if (props.notaMedia !== null && props.notaMedia !== undefined) {
      if (props.notaMedia < 1 || props.notaMedia > 10) {
        return Result.fail(new Error('Nota média deve estar entre 1 e 10'))
      }
    }
    if (props.taxaResposta !== null && props.taxaResposta !== undefined) {
      if (props.taxaResposta < 0 || props.taxaResposta > 100) {
        return Result.fail(new Error('Taxa de resposta deve estar entre 0 e 100'))
      }
    }

    return Result.ok(new Metrica(props))
  }
}
