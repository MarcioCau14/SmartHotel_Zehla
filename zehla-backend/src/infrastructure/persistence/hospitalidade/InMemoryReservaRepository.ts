import { Result } from '../../../domain/shared/Result'
import { DateRange } from '../../../domain/hospitalidade/value-objects/DateRange'
import { Reserva, StatusReserva } from '../../../domain/hospitalidade/entities'
import { IReservaPort } from '../../../application/hospitalidade/ports/IReservaPort'

export class InMemoryReservaRepository implements IReservaPort {
  private reservas: Map<string, Reserva> = new Map()

  async getById(bookingId: string): Promise<Result<Reserva, Error>> {
    const reserva = this.reservas.get(bookingId)
    if (!reserva) return Result.fail(new Error('BOOKING_NOT_FOUND'))
    return Result.ok(reserva)
  }

  async listByGuest(guestId: string): Promise<Result<Reserva[], Error>> {
    const lista = Array.from(this.reservas.values()).filter(r => r.guestId === guestId)
    return Result.ok(lista)
  }

  async listByRoom(roomId: string, periodo?: DateRange): Promise<Result<Reserva[], Error>> {
    let lista = Array.from(this.reservas.values()).filter(r => r.roomId === roomId)
    if (periodo) {
      lista = lista.filter(r => r.periodo.overlaps(periodo))
    }
    return Result.ok(lista)
  }

  async listUpcomingCheckins(timeWindow: DateRange): Promise<Result<Reserva[], Error>> {
    const lista = Array.from(this.reservas.values()).filter(
      r => r.status === StatusReserva.CONFIRMADA && timeWindow.contains(r.periodo.dataInicio)
    )
    return Result.ok(lista)
  }

  async listUpcomingCheckouts(timeWindow: DateRange): Promise<Result<Reserva[], Error>> {
    const lista = Array.from(this.reservas.values()).filter(
      r => r.status === StatusReserva.CHECKIN && timeWindow.contains(r.periodo.dataFim)
    )
    return Result.ok(lista)
  }

  async listByPeriod(periodo: DateRange): Promise<Result<Reserva[], Error>> {
    const lista = Array.from(this.reservas.values()).filter(r => r.periodo.overlaps(periodo))
    return Result.ok(lista)
  }

  async isRoomAvailable(roomId: string, periodo: DateRange): Promise<Result<boolean, Error>> {
    for (const reserva of this.reservas.values()) {
      if (
        reserva.roomId === roomId &&
        reserva.status !== StatusReserva.CANCELADA &&
        reserva.status !== StatusReserva.FINALIZADA &&
        reserva.periodo.overlaps(periodo)
      ) {
        return Result.ok(false)
      }
    }
    return Result.ok(true)
  }

  async save(reserva: Reserva): Promise<Result<Reserva, Error>> {
    this.reservas.set(reserva.id, reserva)
    return Result.ok(reserva)
  }

  async delete(bookingId: string): Promise<Result<void, Error>> {
    this.reservas.delete(bookingId)
    return Result.ok(undefined)
  }

  clear(): void {
    this.reservas.clear()
  }

  count(): number {
    return this.reservas.size
  }
}
