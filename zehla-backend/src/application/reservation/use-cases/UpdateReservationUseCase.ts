import { Result } from '../../../domain/shared/Result'
import { IReservationRepository } from '../ports/IReservationRepository'
import { IAvailabilityService } from '../ports/IAvailabilityService'
import { GuestInfo } from '../../../domain/reservation/value-objects/GuestInfo'
import { DateRange } from '../../../domain/reservation/value-objects/DateRange'

export interface UpdateReservationInput {
  reservationId: string
  guestName?: string
  guestPhone?: string
  guestEmail?: string
  guestCpf?: string
  checkIn?: string
  checkOut?: string
  notes?: string
}

export interface UpdateReservationOutput {
  id: string
  status: string
  guestName: string
  guestPhone: string
  checkIn: string
  checkOut: string
  notes?: string
}

export class UpdateReservationUseCase {
  constructor(
    private reservationRepo: IReservationRepository,
    private availabilityService: IAvailabilityService
  ) {}

  async execute(input: UpdateReservationInput): Promise<Result<UpdateReservationOutput, string>> {
    const reservation = await this.reservationRepo.findById(input.reservationId)
    if (!reservation) {
      return Result.fail('Reserva não encontrada')
    }

    if (input.guestName !== undefined || input.guestEmail !== undefined || input.guestPhone !== undefined || input.guestCpf !== undefined) {
      const guestInfoResult = GuestInfo.create({
        name: input.guestName ?? reservation.guestInfo.name,
        email: input.guestEmail ?? reservation.guestInfo.email,
        phone: input.guestPhone ?? reservation.guestInfo.phone,
        cpf: input.guestCpf ?? reservation.guestInfo.cpf,
      })
      if (guestInfoResult.isFail) return Result.fail(guestInfoResult.error)
      reservation.updateGuestInfo(guestInfoResult.value)
    }

    if (input.checkIn !== undefined || input.checkOut !== undefined) {
      const newCheckIn = input.checkIn ? new Date(input.checkIn) : reservation.period.checkIn
      const newCheckOut = input.checkOut ? new Date(input.checkOut) : reservation.period.checkOut

      const periodResult = DateRange.createForUpdate(newCheckIn, newCheckOut)
      if (periodResult.isFail) return Result.fail(periodResult.error)

      const isAvailable = await this.availabilityService.isRoomAvailable(
        reservation.roomId,
        periodResult.value,
        reservation.id
      )
      if (!isAvailable) {
        return Result.fail('Quarto não disponível para as novas datas selecionadas')
      }

      reservation.updatePeriod(periodResult.value)
    }

    if (input.notes !== undefined) {
      reservation.updateNotes(input.notes)
    }

    await this.reservationRepo.update(reservation)

    return Result.ok({
      id: reservation.id,
      status: reservation.status,
      guestName: reservation.guestInfo.name,
      guestPhone: reservation.guestInfo.phone,
      checkIn: reservation.period.checkIn.toISOString(),
      checkOut: reservation.period.checkOut.toISOString(),
      notes: reservation.notes,
    })
  }
}
