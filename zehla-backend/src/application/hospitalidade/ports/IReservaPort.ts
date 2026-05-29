import { Result } from '../../../domain/shared/Result'
import { DateRange } from '../../../domain/hospitalidade/value-objects/DateRange'
import { Reserva } from '../../../domain/hospitalidade/entities'

export interface IReservaPort {
  getById(bookingId: string): Promise<Result<Reserva, Error>>
  listByGuest(guestId: string): Promise<Result<Reserva[], Error>>
  listByRoom(roomId: string, periodo?: DateRange): Promise<Result<Reserva[], Error>>
  listUpcomingCheckins(timeWindow: DateRange): Promise<Result<Reserva[], Error>>
  listUpcomingCheckouts(timeWindow: DateRange): Promise<Result<Reserva[], Error>>
  listByPeriod(periodo: DateRange): Promise<Result<Reserva[], Error>>
  isRoomAvailable(roomId: string, periodo: DateRange): Promise<Result<boolean, Error>>
  save(reserva: Reserva): Promise<Result<Reserva, Error>>
  delete(bookingId: string): Promise<Result<void, Error>>
}
