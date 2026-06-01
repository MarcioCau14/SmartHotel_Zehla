import { Result } from '../../../domain/shared/Result'
import { IReservationRepository } from '../ports/IReservationRepository'
import { IRoomRepository } from '../ports/IRoomRepository'
import { IEventBus } from '../ports/IEventBus'
import { RoomStatus } from '../../../domain/room/enums'

export interface CheckOutInput {
  reservationId: string
}

export interface CheckOutOutput {
  reservationId: string
  roomStatus: string
}

export class CheckOutUseCase {
  constructor(
    private reservationRepo: IReservationRepository,
    private roomRepo: IRoomRepository,
    private eventBus: IEventBus
  ) {}

  async execute(input: CheckOutInput): Promise<Result<CheckOutOutput, string>> {
    const reservation = await this.reservationRepo.findById(input.reservationId)
    if (!reservation) {
      return Result.fail('Reserva não encontrada')
    }

    const checkOutResult = reservation.checkOut()
    if (checkOutResult.isFail) {
      return Result.fail(checkOutResult.error)
    }

    await this.reservationRepo.update(reservation)
    await this.roomRepo.updateStatus(reservation.roomId, RoomStatus.CLEANING)
    await this.eventBus.publishMany(reservation.events)
    reservation.clearEvents()

    return Result.ok({
      reservationId: reservation.id,
      roomStatus: 'CLEANING',
    })
  }
}
