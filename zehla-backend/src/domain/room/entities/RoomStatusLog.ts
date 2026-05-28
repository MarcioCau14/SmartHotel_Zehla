import { Result } from '../../shared/Result'
import { RoomStatus } from '../enums'

export interface RoomStatusLogData {
  id: string
  roomId: string
  previousStatus: RoomStatus
  newStatus: RoomStatus
  reason?: string
  changedBy: string
  createdAt: Date
}

export class RoomStatusLog {
  private constructor(private data: RoomStatusLogData) {}

  static create(props: {
    id: string
    roomId: string
    previousStatus: RoomStatus
    newStatus: RoomStatus
    reason?: string
    changedBy: string
  }): Result<RoomStatusLog, string> {
    if (!props.id) return Result.fail('ID do log é obrigatório')
    if (!props.roomId) return Result.fail('ID do quarto é obrigatório')
    if (!props.changedBy) return Result.fail('changedBy é obrigatório')
    if (props.previousStatus === props.newStatus) {
      return Result.fail('Status de origem e destino devem ser diferentes')
    }

    return Result.ok(
      new RoomStatusLog({
        ...props,
        createdAt: new Date(),
      })
    )
  }

  get id(): string { return this.data.id }
  get roomId(): string { return this.data.roomId }
  get previousStatus(): RoomStatus { return this.data.previousStatus }
  get newStatus(): RoomStatus { return this.data.newStatus }
  get reason(): string | undefined { return this.data.reason }
  get changedBy(): string { return this.data.changedBy }
  get createdAt(): Date { return this.data.createdAt }

  toJSON() {
    return {
      id: this.data.id,
      roomId: this.data.roomId,
      previousStatus: this.data.previousStatus,
      newStatus: this.data.newStatus,
      reason: this.data.reason,
      changedBy: this.data.changedBy,
      createdAt: this.data.createdAt.toISOString(),
    }
  }
}
