import { Result } from '../../../domain/shared/Result'
import { Room } from '../../../domain/room/entities/Room'
import { RoomStatus } from '../../../domain/room/enums'
import { RoomStatusLog } from '../../../domain/room/entities/RoomStatusLog'
import { IRoomRepository } from '../ports/IRoomRepository'
import { IRoomStatusLogRepository } from '../ports/IRoomStatusLogRepository'

export interface UpdateRoomStatusInput {
  roomId: string
  status: string
  reason?: string
  changedBy: string
}

export interface UpdateRoomStatusOutput {
  id: string
  previousStatus: string
  newStatus: string
}

export class UpdateRoomStatusUseCase {
  constructor(
    private roomRepo: IRoomRepository,
    private logRepo: IRoomStatusLogRepository
  ) {}

  async execute(input: UpdateRoomStatusInput): Promise<Result<UpdateRoomStatusOutput, string>> {
    const room = await this.roomRepo.findById(input.roomId)
    if (!room) return Result.fail('Quarto não encontrado')

    const newStatus = input.status as RoomStatus
    if (!Object.values(RoomStatus).includes(newStatus)) {
      return Result.fail(`Status inválido: ${input.status}`)
    }

    const previousStatus = room.status
    const result = room.changeStatus(newStatus, input.reason)
    if (result.isFail) return Result.fail(result.error)

    const logResult = RoomStatusLog.create({
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      roomId: input.roomId,
      previousStatus,
      newStatus,
      reason: input.reason,
      changedBy: input.changedBy,
    })
    if (logResult.isOk) {
      await this.logRepo.save(logResult.value)
    }

    await this.roomRepo.update(room)
    room.clearEvents()

    return Result.ok({
      id: room.id,
      previousStatus,
      newStatus,
    })
  }
}
