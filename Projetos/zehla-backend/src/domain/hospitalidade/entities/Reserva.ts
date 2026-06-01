import { Result } from '../../shared/Result'
import { StatusReserva, TRANSICOES_VALIDAS } from './StatusReserva'
import { Money } from '../value-objects/Money'
import { DateRange } from '../value-objects/DateRange'

export interface ServicoContratado {
  serviceId: string
  nome: string
  quantidade: number
  precoUnitario: Money
  dataContratacao: Date
}

export interface CriarReservaProps {
  id: string
  guestId: string
  roomId: string
  periodo: DateRange
  numeroHospedes: number
  capacidadeMaxima: number
  diariaBase: Money
}

export class Reserva {
  private _status: StatusReserva
  private _numeroHospedes: number
  private _servicosContratados: ServicoContratado[]
  private _descontoAplicado: Money | undefined
  private _checkInRealizado: Date | undefined
  private _checkOutRealizado: Date | undefined
  private _dataCancelamento: Date | undefined
  private _motivoCancelamento: string | undefined

  constructor(
    public readonly id: string,
    public readonly guestId: string,
    public readonly roomId: string,
    public readonly periodo: DateRange,
    public readonly diariaBase: Money,
    public readonly dataCriacao: Date
  ) {
    this._status = StatusReserva.PENDENTE
    this._numeroHospedes = 1
    this._servicosContratados = []
  }

  static create(props: CriarReservaProps): Result<Reserva, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('BOOKING_ID_REQUIRED'))
    }
    if (!props.guestId || props.guestId.trim().length === 0) {
      return Result.fail(new Error('BOOKING_GUEST_REQUIRED'))
    }
    if (!props.roomId || props.roomId.trim().length === 0) {
      return Result.fail(new Error('BOOKING_ROOM_REQUIRED'))
    }
    if (props.numeroHospedes < 1) {
      return Result.fail(new Error('BOOKING_INVALID_GUEST_COUNT'))
    }
    if (props.numeroHospedes > props.capacidadeMaxima) {
      return Result.fail(new Error('ROOM_CAPACITY_EXCEEDED'))
    }
    return Result.ok(new Reserva(props.id, props.guestId, props.roomId, props.periodo, props.diariaBase, new Date()))
  }

  get status(): StatusReserva {
    return this._status
  }

  get numeroHospedes(): number {
    return this._numeroHospedes
  }

  get servicosContratados(): readonly ServicoContratado[] {
    return [...this._servicosContratados]
  }

  get descontoAplicado(): Money | undefined {
    return this._descontoAplicado
  }

  get checkInRealizado(): Date | undefined {
    return this._checkInRealizado
  }

  get checkOutRealizado(): Date | undefined {
    return this._checkOutRealizado
  }

  get dataCancelamento(): Date | undefined {
    return this._dataCancelamento
  }

  get motivoCancelamento(): string | undefined {
    return this._motivoCancelamento
  }

  get valorTotal(): Money {
    const totalDiarias = this.diariaBase.multiply(this.periodo.noites)
    if (totalDiarias.isFail) return Money.create(0).value

    let total = totalDiarias.value
    for (const servico of this._servicosContratados) {
      const sub = servico.precoUnitario.multiply(servico.quantidade)
      if (sub.isOk) {
        const sum = total.add(sub.value)
        if (sum.isOk) total = sum.value
      }
    }
    if (this._descontoAplicado) {
      const comDesconto = total.subtract(this._descontoAplicado)
      if (comDesconto.isOk) total = comDesconto.value
    }
    return total
  }

  confirmar(): Result<Reserva, Error> {
    if (!TRANSICOES_VALIDAS[this._status].includes(StatusReserva.CONFIRMADA)) {
      return Result.fail(new Error(`BOOKING_WRONG_STATUS: cannot confirm from ${this._status}`))
    }
    this._status = StatusReserva.CONFIRMADA
    return Result.ok(this)
  }

  realizarCheckIn(dataCheckIn: Date): Result<Reserva, Error> {
    if (!TRANSICOES_VALIDAS[this._status].includes(StatusReserva.CHECKIN)) {
      return Result.fail(new Error(`BOOKING_WRONG_STATUS: cannot check-in from ${this._status}`))
    }
    const diffMs = Math.abs(dataCheckIn.getTime() - this.periodo.dataInicio.getTime())
    const diffHoras = diffMs / (1000 * 60 * 60)
    if (diffHoras > 2 && dataCheckIn < this.periodo.dataInicio) {
      return Result.fail(new Error('CHECKIN_TOO_EARLY'))
    }
    this._status = StatusReserva.CHECKIN
    this._checkInRealizado = dataCheckIn
    return Result.ok(this)
  }

  realizarCheckOut(dataCheckOut: Date): Result<Reserva, Error> {
    if (!TRANSICOES_VALIDAS[this._status].includes(StatusReserva.CHECKOUT)) {
      return Result.fail(new Error(`BOOKING_WRONG_STATUS: cannot check-out from ${this._status}`))
    }
    if (dataCheckOut < this.periodo.dataFim) {
      const diffHoras = (this.periodo.dataFim.getTime() - dataCheckOut.getTime()) / (1000 * 60 * 60)
      if (diffHoras > 12) {
        return Result.fail(new Error('CHECKOUT_BEFORE_DEPARTURE'))
      }
    }
    this._status = StatusReserva.CHECKOUT
    this._checkOutRealizado = dataCheckOut
    return Result.ok(this)
  }

  finalizar(): Result<Reserva, Error> {
    if (!TRANSICOES_VALIDAS[this._status].includes(StatusReserva.FINALIZADA)) {
      return Result.fail(new Error(`BOOKING_WRONG_STATUS: cannot finalize from ${this._status}`))
    }
    this._status = StatusReserva.FINALIZADA
    return Result.ok(this)
  }

  cancelar(motivo?: string): Result<Reserva, Error> {
    if (!TRANSICOES_VALIDAS[this._status].includes(StatusReserva.CANCELADA)) {
      return Result.fail(new Error(`BOOKING_WRONG_STATUS: cannot cancel from ${this._status}`))
    }
    this._status = StatusReserva.CANCELADA
    this._dataCancelamento = new Date()
    this._motivoCancelamento = motivo?.trim()
    return Result.ok(this)
  }

  calcularMultaCancelamento(): Money {
    if (this._status !== StatusReserva.CONFIRMADA) {
      return Money.create(0).value
    }
    const diffHorasCheckIn = (this.periodo.dataInicio.getTime() - Date.now()) / (1000 * 60 * 60)
    if (diffHorasCheckIn < 48) {
      const multa = this.diariaBase.multiply(0.5)
      return multa.isOk ? multa.value : Money.create(0).value
    }
    return Money.create(0).value
  }

  adicionarServico(servico: ServicoContratado): Result<Reserva, Error> {
    if (this._status !== StatusReserva.CONFIRMADA && this._status !== StatusReserva.CHECKIN) {
      return Result.fail(new Error('SERVICE_CANNOT_BE_ADDED'))
    }
    const existente = this._servicosContratados.find(s => s.serviceId === servico.serviceId)
    if (existente) {
      existente.quantidade += servico.quantidade
    } else {
      this._servicosContratados.push({ ...servico })
    }
    return Result.ok(this)
  }

  aplicarDesconto(desconto: Money, valorTotalAntes: Money): Result<Reserva, Error> {
    if (desconto.isGreaterThan(valorTotalAntes)) {
      return Result.fail(new Error('DISCOUNT_EXCEEDS_TOTAL'))
    }
    this._descontoAplicado = desconto
    return Result.ok(this)
  }
}
