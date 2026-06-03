import { Result } from '../../../shared/Result'

export type ReservationStatus = 'COMPLETED' | 'FUTURE' | 'CANCELLED'

export interface ReservationSnapshotProps {
  id: string
  leadId: string
  checkoutDate: Date
  status: ReservationStatus
  propriedadeId: string
}

export class ReservationSnapshot {
  private constructor(
    public readonly id: string,
    public readonly leadId: string,
    public readonly checkoutDate: Date,
    public readonly status: ReservationStatus,
    public readonly propriedadeId: string,
  ) {
    Object.freeze(this)
  }

  static create(props: ReservationSnapshotProps): Result<ReservationSnapshot, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID da reserva é obrigatório'))
    }
    if (!props.leadId || props.leadId.trim().length === 0) {
      return Result.fail(new Error('ID do lead é obrigatório'))
    }
    if (!(props.checkoutDate instanceof Date) || isNaN(props.checkoutDate.getTime())) {
      return Result.fail(new Error('checkoutDate deve ser uma data válida'))
    }
    if (!['COMPLETED', 'FUTURE', 'CANCELLED'].includes(props.status)) {
      return Result.fail(new Error(`Status inválido: ${props.status}`))
    }
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }

    return Result.ok(
      new ReservationSnapshot(
        props.id.trim(),
        props.leadId.trim(),
        props.checkoutDate,
        props.status,
        props.propriedadeId.trim(),
      ),
    )
  }
}
