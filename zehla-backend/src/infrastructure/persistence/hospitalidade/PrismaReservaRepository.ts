import { PrismaClient } from '@prisma/client'
import { Result } from '../../../domain/shared/Result'
import { Reserva, ServicoContratado } from '../../../domain/hospitalidade/entities/Reserva'
import { StatusReserva } from '../../../domain/hospitalidade/entities/StatusReserva'
import { DateRange } from '../../../domain/hospitalidade/value-objects/DateRange'
import { Money } from '../../../domain/hospitalidade/value-objects/Money'
import { IReservaPort } from '../../../application/hospitalidade/ports/IReservaPort'

export class PrismaReservaRepository implements IReservaPort {
  constructor(
    private readonly prisma: any,
    private readonly propertyId: string
  ) {}

  async getById(bookingId: string): Promise<Result<Reserva, Error>> {
    const row = await this.prisma.reservaHosp.findUnique({ where: { id: bookingId } })
    if (!row || row.propertyId !== this.propertyId) {
      return Result.fail(new Error('BOOKING_NOT_FOUND'))
    }
    return Result.ok(this.hydrate(row))
  }

  async listByGuest(guestId: string): Promise<Result<Reserva[], Error>> {
    const rows = await this.prisma.reservaHosp.findMany({
      where: { hospedeId: guestId, propertyId: this.propertyId },
      orderBy: { dataInicio: 'desc' },
    })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async listByRoom(roomId: string, periodo?: DateRange): Promise<Result<Reserva[], Error>> {
    const where: any = { quartoId: roomId, propertyId: this.propertyId }
    if (periodo) {
      where.OR = [
        { dataInicio: { lt: periodo.dataFim }, dataFim: { gt: periodo.dataInicio } },
      ]
    }
    const rows = await this.prisma.reservaHosp.findMany({ where, orderBy: { dataInicio: 'asc' } })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async listUpcomingCheckins(timeWindow: DateRange): Promise<Result<Reserva[], Error>> {
    const rows = await this.prisma.reservaHosp.findMany({
      where: {
        propertyId: this.propertyId,
        status: StatusReserva.CONFIRMADA,
        dataInicio: { gte: timeWindow.dataInicio, lte: timeWindow.dataFim },
      },
      orderBy: { dataInicio: 'asc' },
    })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async listUpcomingCheckouts(timeWindow: DateRange): Promise<Result<Reserva[], Error>> {
    const rows = await this.prisma.reservaHosp.findMany({
      where: {
        propertyId: this.propertyId,
        status: StatusReserva.CHECKIN,
        dataFim: { gte: timeWindow.dataInicio, lte: timeWindow.dataFim },
      },
      orderBy: { dataFim: 'asc' },
    })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async listByPeriod(periodo: DateRange): Promise<Result<Reserva[], Error>> {
    const rows = await this.prisma.reservaHosp.findMany({
      where: {
        propertyId: this.propertyId,
        OR: [
          { dataInicio: { lt: periodo.dataFim }, dataFim: { gt: periodo.dataInicio } },
        ],
      },
      orderBy: { dataInicio: 'asc' },
    })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async isRoomAvailable(roomId: string, periodo: DateRange): Promise<Result<boolean, Error>> {
    const count = await this.prisma.reservaHosp.count({
      where: {
        propertyId: this.propertyId,
        quartoId: roomId,
        status: { notIn: [StatusReserva.CANCELADA, StatusReserva.FINALIZADA] },
        dataInicio: { lt: periodo.dataFim },
        dataFim: { gt: periodo.dataInicio },
      },
    })
    return Result.ok(count === 0)
  }

  async save(reserva: Reserva): Promise<Result<Reserva, Error>> {
    const data = this.toData(reserva)
    await this.prisma.reservaHosp.upsert({
      where: { id: reserva.id },
      create: { ...data, propertyId: this.propertyId },
      update: data,
    })
    return Result.ok(reserva)
  }

  async delete(bookingId: string): Promise<Result<void, Error>> {
    await this.prisma.reservaHosp.deleteMany({
      where: { id: bookingId, propertyId: this.propertyId },
    })
    return Result.ok(undefined)
  }

  private toData(r: Reserva): any {
    return {
      id: r.id,
      hospedeId: r.guestId,
      quartoId: r.roomId,
      dataInicio: r.periodo.dataInicio,
      dataFim: r.periodo.dataFim,
      status: r.status,
      numeroHospedes: r.numeroHospedes,
      diariaBase: r.diariaBase.centavos,
      checkInRealizado: r.checkInRealizado ?? null,
      checkOutRealizado: r.checkOutRealizado ?? null,
      dataCancelamento: r.dataCancelamento ?? null,
      motivoCancelamento: r.motivoCancelamento ?? null,
      descontoAplicado: r.descontoAplicado?.centavos ?? 0,
      servicos: r.servicosContratados.length > 0 ? r.servicosContratados : undefined,
    }
  }

  private hydrate(row: any): Reserva {
    const periodo = DateRange.create(new (globalThis as any).Date(row.dataInicio), new (globalThis as any).Date(row.dataFim))
    const diariaBase = Money.create(row.diariaBase ?? 0)
    const reserva = Reserva.create({
      id: row.id,
      guestId: row.hospedeId,
      roomId: row.quartoId,
      periodo: periodo.isOk ? periodo.value : DateRange.create(new (globalThis as any).Date(), new (globalThis as any).Date((globalThis as any).Date.now() + 86400000)).value,
      numeroHospedes: row.numeroHospedes ?? 1,
      capacidadeMaxima: 99,
      diariaBase: diariaBase.isOk ? diariaBase.value : Money.create(0).value,
    }).value;

    (reserva as any)['_status'] = row.status
    if (row.checkInRealizado) (reserva as any)['_checkInRealizado'] = new (globalThis as any).Date(row.checkInRealizado)
    if (row.checkOutRealizado) (reserva as any)['_checkOutRealizado'] = new (globalThis as any).Date(row.checkOutRealizado)
    if (row.dataCancelamento) {
      (reserva as any)['_dataCancelamento'] = new (globalThis as any).Date(row.dataCancelamento)
      (reserva as any)['_motivoCancelamento'] = row.motivoCancelamento
    }
    if (row.descontoAplicado) {
      const desc = Money.create(row.descontoAplicado)
      if (desc.isOk) (reserva as any)['_descontoAplicado'] = desc.value
    }
    if (row.servicos) {
      try {
        const servicos: ServicoContratado[] = typeof row.servicos === 'string' ? JSON.parse(row.servicos) : row.servicos
        for (const s of servicos) {
          const preco = Money.create(s.precoUnitario.centavos ?? s.precoUnitario)
          if (preco.isOk) {
            (reserva as any)['_servicosContratados'].push({
              serviceId: s.serviceId,
              nome: s.nome,
              quantidade: s.quantidade,
              precoUnitario: preco.value,
              dataContratacao: new globalThis.Date(s.dataContratacao),
            })
          }
        }
      } catch { }
    }
    return reserva
  }
}
