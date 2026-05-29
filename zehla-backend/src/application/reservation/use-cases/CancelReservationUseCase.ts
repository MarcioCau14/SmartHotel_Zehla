import { Result } from '../../../domain/shared/Result'
import { IReservationRepository } from '../ports/IReservationRepository'
import { IRoomRepository } from '../ports/IRoomRepository'
import { IEventBus } from '../ports/IEventBus'
import { RoomStatus } from '../../../domain/room/enums'

export interface CancelReservationInput {
  reservationId: string
}

export class CancelReservationUseCase {
  constructor(
    private reservationRepo: IReservationRepository,
    private roomRepo: IRoomRepository,
    private eventBus: IEventBus
  ) {}

  async execute(input: CancelReservationInput): Promise<Result<void, string>> {
    const reservation = await this.reservationRepo.findById(input.reservationId)
    if (!reservation) {
      return Result.fail('Reserva não encontrada')
    }

    const result = reservation.cancel()
    if (result.isFail) {
      return result
    }

    await this.reservationRepo.update(reservation)
    await this.roomRepo.updateStatus(reservation.roomId, RoomStatus.AVAILABLE)
    await this.eventBus.publishMany(reservation.events)
    reservation.clearEvents()

    return Result.ok(undefined)
  }
}
