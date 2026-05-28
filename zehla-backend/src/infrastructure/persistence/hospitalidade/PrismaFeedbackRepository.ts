import { PrismaClient } from '@prisma/client'
import { Result } from '../../../domain/shared/Result'
import { Feedback } from '../../../domain/hospitalidade/entities/Feedback'
import { DateRange } from '../../../domain/hospitalidade/value-objects/DateRange'
import { IFeedbackPort } from '../../../application/hospitalidade/ports/IFeedbackPort'

export class PrismaFeedbackRepository implements IFeedbackPort {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly propertyId: string
  ) {}

  async getById(feedbackId: string): Promise<Result<Feedback, Error>> {
    const row = await this.prisma.feedbackHosp.findUnique({ where: { id: feedbackId } })
    if (!row || row.propertyId !== this.propertyId) {
      return Result.fail(new Error('FEEDBACK_NOT_FOUND'))
    }
    return Result.ok(this.hydrate(row))
  }

  async listByPeriod(periodo: DateRange): Promise<Result<Feedback[], Error>> {
    const rows = await this.prisma.feedbackHosp.findMany({
      where: {
        propertyId: this.propertyId,
        createdAt: { gte: periodo.dataInicio, lte: periodo.dataFim },
      },
      orderBy: { createdAt: 'desc' },
    })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async listByBooking(bookingId: string): Promise<Result<Feedback[], Error>> {
    const rows = await this.prisma.feedbackHosp.findMany({
      where: { propertyId: this.propertyId, reservaId: bookingId },
      orderBy: { createdAt: 'desc' },
    })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async save(feedback: Feedback): Promise<Result<Feedback, Error>> {
    const data = this.toData(feedback)
    await this.prisma.feedbackHosp.upsert({
      where: { id: feedback.id },
      create: { ...data, propertyId: this.propertyId },
      update: data,
    })
    return Result.ok(feedback)
  }

  async getNPS(periodo: DateRange): Promise<Result<number, Error>> {
    const rows = await this.prisma.feedbackHosp.findMany({
      where: {
        propertyId: this.propertyId,
        createdAt: { gte: periodo.dataInicio, lte: periodo.dataFim },
      },
      select: { notaGeral: true },
    })
    if (rows.length === 0) return Result.ok(0)
    const promoters = rows.filter(r => r.notaGeral >= 9).length
    const detractors = rows.filter(r => r.notaGeral <= 6).length
    const nps = Math.round(((promoters - detractors) / rows.length) * 100)
    return Result.ok(nps)
  }

  private toData(f: Feedback): any {
    return {
      id: f.id,
      reservaId: f.bookingId,
      notaGeral: f.notaGeral,
      comentario: f.comentario ?? null,
      categorias: f.categorias ?? null,
    }
  }

  private hydrate(row: any): Feedback {
    const result = Feedback.create({
      id: row.id,
      bookingId: row.reservaId,
      notaGeral: row.notaGeral,
      comentario: row.comentario ?? undefined,
      categorias: row.categorias ?? undefined,
    })
    if (result.isFail) throw result.error
    return result.value
  }
}
