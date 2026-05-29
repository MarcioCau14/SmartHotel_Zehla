import { Result } from '../../../domain/shared/Result'
import { StatusReserva } from '../../../domain/hospitalidade/entities/StatusReserva'
import { Reserva } from '../../../domain/hospitalidade/entities/Reserva'
import { IReservaPort } from '../ports/IReservaPort'

export class CancelarReservaUseCase {
  constructor(private readonly reservaPort: IReservaPort) {}

  async execute(bookingId: string, motivo?: string): Promise<Result<Reserva, Error>> {
    const reservaResult = await this.reservaPort.getById(bookingId)
    if (reservaResult.isFail) return Result.fail(reservaResult.error)

    const result = reservaResult.value.cancelar(motivo)
    if (result.isFail) return Result.fail(result.error)

    return this.reservaPort.save(result.value)
  }
}
