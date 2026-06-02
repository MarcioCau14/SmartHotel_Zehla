import { Result } from '../../../shared/Result'

export type InteractionOutcome = 'CONVERTED' | 'LOST' | 'PENDING'

export interface InteractionRecordProps {
  id: string
  leadId: string
  canal: string
  timestamp: Date
  sentimentScore: number
  tokenCost: number
  outcome: InteractionOutcome
  resumo?: string
}

export class InteractionRecord {
  private constructor(
    public readonly id: string,
    public readonly leadId: string,
    public readonly canal: string,
    public readonly timestamp: Date,
    public readonly sentimentScore: number,
    public readonly tokenCost: number,
    public readonly outcome: InteractionOutcome,
    public readonly resumo: string | undefined,
  ) {
    Object.freeze(this)
  }

  static create(props: InteractionRecordProps): Result<InteractionRecord, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID da interação é obrigatório'))
    }
    if (!props.leadId || props.leadId.trim().length === 0) {
      return Result.fail(new Error('ID do lead é obrigatório'))
    }
    if (!props.canal || props.canal.trim().length === 0) {
      return Result.fail(new Error('Canal da interação é obrigatório'))
    }
    if (props.sentimentScore < -1 || props.sentimentScore > 1) {
      return Result.fail(new Error('Sentiment score deve estar entre -1 e 1'))
    }
    if (props.tokenCost < 0) {
      return Result.fail(new Error('Custo de tokens não pode ser negativo'))
    }
    if (!['CONVERTED', 'LOST', 'PENDING'].includes(props.outcome)) {
      return Result.fail(new Error('Outcome inválido: deve ser CONVERTED, LOST ou PENDING'))
    }

    return Result.ok(
      new InteractionRecord(
        props.id.trim(),
        props.leadId.trim(),
        props.canal.trim(),
        props.timestamp ?? new Date(),
        props.sentimentScore,
        props.tokenCost,
        props.outcome,
        props.resumo?.trim(),
      ),
    )
  }
}
