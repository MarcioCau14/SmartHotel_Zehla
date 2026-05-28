import { Result } from '../../../domain/shared/Result'
import { Reserva } from '../../../domain/hospitalidade/entities/Reserva'
import { DateRange } from '../../../domain/hospitalidade/value-objects/DateRange'
import { Money } from '../../../domain/hospitalidade/value-objects/Money'
import { IReservaPort } from '../ports/IReservaPort'
import { IHospedePort } from '../ports/IHospedePort'
import { IQuartoPort } from '../ports/IQuartoPort'

export interface CreateReservaInput {
  id: string
  guestId: string
  roomId: string
  dataInicio: Date
  dataFim: Date
  numeroHospedes: number
}

export class CreateReservaUseCase {
  constructor(
    private readonly reservaPort: IReservaPort,
    private readonly hospedePort: IHospedePort,
    private readonly quartoPort: IQuartoPort
  ) {}

  async execute(input: CreateReservaInput): Promise<Result<Reserva, Error>> {
    const hospede = await this.hospedePort.getById(input.guestId)
    if (hospede.isFail) return Result.fail(hospede.error)

    const quarto = await this.quartoPort.getById(input.roomId)
    if (quarto.isFail) return Result.fail(quarto.error)

    const periodo = DateRange.create(input.dataInicio, input.dataFim)
    if (periodo.isFail) return Result.fail(periodo.error)

    const disponivel = await this.reservaPort.isRoomAvailable(input.roomId, periodo.value)
    if (disponivel.isFail || !disponivel.value) {
      return Result.fail(new Error('ROOM_UNAVAILABLE'))
    }

    const reserva = Reserva.create({
      id: input.id,
      guestId: input.guestId,
      roomId: input.roomId,
      periodo: periodo.value,
      numeroHospedes: input.numeroHospedes,
      capacidadeMaxima: quarto.value.capacidadeMaxima,
      diariaBase: quarto.value.diariaBase,
    })
    if (reserva.isFail) return Result.fail(reserva.error)

    return this.reservaPort.save(reserva.value)
  }
}
