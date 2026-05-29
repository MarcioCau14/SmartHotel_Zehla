import { Result } from '../../shared/Result'

export interface CriarFeedbackProps {
  id: string
  bookingId: string
  notaGeral: number
  comentario?: string
  categorias?: Record<string, number>
}

export class Feedback {
  public readonly dataCriacao: Date
  private _comentario: string | undefined
  private _categorias: Record<string, number> | undefined

  constructor(
    public readonly id: string,
    public readonly bookingId: string,
    public readonly notaGeral: number
  ) {
    this.dataCriacao = new Date()
  }

  static create(props: CriarFeedbackProps): Result<Feedback, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('FEEDBACK_ID_REQUIRED'))
    }
    if (!props.bookingId || props.bookingId.trim().length === 0) {
      return Result.fail(new Error('FEEDBACK_BOOKING_REQUIRED'))
    }
    if (!Number.isInteger(props.notaGeral) || props.notaGeral < 0 || props.notaGeral > 10) {
      return Result.fail(new Error('FEEDBACK_INVALID_RATING'))
    }
    const feedback = new Feedback(props.id.trim(), props.bookingId.trim(), props.notaGeral)
    feedback._comentario = props.comentario?.trim()
    feedback._categorias = props.categorias ? { ...props.categorias } : undefined
    return Result.ok(feedback)
  }

  get comentario(): string | undefined {
    return this._comentario
  }

  get categorias(): Record<string, number> | undefined {
    return this._categorias ? { ...this._categorias } : undefined
  }

  get ehCritico(): boolean {
    return this.notaGeral < 4
  }
}
