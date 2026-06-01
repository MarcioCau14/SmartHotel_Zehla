import { Result } from '../../../domain/shared/Result'
import { IReservationRepository } from '../ports/IReservationRepository'
import { IRoomRepository } from '../ports/IRoomRepository'
import { IEventBus } from '../ports/IEventBus'
import { RoomStatus } from '../../../domain/room/enums'

export interface CheckInInput {
  reservationId: string
}

export interface CheckInOutput {
  reservationId: string
  roomStatus: string
}

export class CheckInUseCase {
  constructor(
    private reservationRepo: IReservationRepository,
    private roomRepo: IRoomRepository,
    private eventBus: IEventBus
  ) {}

  async execute(input: CheckInInput): Promise<Result<CheckInOutput, string>> {
    const reservation = await this.reservationRepo.findById(input.reservationId)
    if (!reservation) {
      return Result.fail('Reserva não encontrada')
    }

    const checkInResult = reservation.checkIn()
    if (checkInResult.isFail) {
      return Result.fail(checkInResult.error)
    }

    await this.reservationRepo.update(reservation)
    await this.roomRepo.updateStatus(reservation.roomId, RoomStatus.OCCUPIED)
    await this.eventBus.publishMany(reservation.events)
    reservation.clearEvents()

    return Result.ok({
      reservationId: reservation.id,
      roomStatus: 'OCCUPIED',
    })
  }
}
