import { PrismaClient } from '@prisma/client'
import { Result } from '../../../domain/shared/Result'
import { Quarto } from '../../../domain/hospitalidade/entities/Quarto'
import { TipoQuarto, StatusQuarto } from '../../../domain/hospitalidade/entities'
import { Money } from '../../../domain/hospitalidade/value-objects/Money'
import { DateRange } from '../../../domain/hospitalidade/value-objects/DateRange'
import { IQuartoPort } from '../../../application/hospitalidade/ports/IQuartoPort'

export class PrismaQuartoRepository implements IQuartoPort {
  constructor(
    private readonly prisma: any,
    private readonly propertyId: string
  ) {}

  async getById(roomId: string): Promise<Result<Quarto, Error>> {
    const row = await this.prisma.quartoHosp.findUnique({
      where: { id: roomId },
    })
    if (!row || row.propertyId !== this.propertyId) {
      return Result.fail(new Error('ROOM_NOT_FOUND'))
    }
    return Result.ok(this.hydrate(row))
  }

  async listAvailable(periodo: DateRange, capacidadeMinima?: number): Promise<Result<Quarto[], Error>> {
    const where: any = {
      propertyId: this.propertyId,
      status: StatusQuarto.DISPONIVEL,
    }
    if (capacidadeMinima !== undefined) {
      where.capacidadeMaxima = { gte: capacidadeMinima }
    }
    const rows = await this.prisma.quartoHosp.findMany({ where })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async listByTipo(tipo: TipoQuarto): Promise<Result<Quarto[], Error>> {
    const rows = await this.prisma.quartoHosp.findMany({
      where: { propertyId: this.propertyId, tipo },
    })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async save(quarto: Quarto): Promise<Result<Quarto, Error>> {
    const data = this.toData(quarto)
    await this.prisma.quartoHosp.upsert({
      where: { id: quarto.id },
      create: { ...data, propertyId: this.propertyId },
      update: data,
    })
    return Result.ok(quarto)
  }

  async updateStatus(roomId: string, status: StatusQuarto): Promise<Result<Quarto, Error>> {
    const now = new Date()
    await this.prisma.quartoHosp.updateMany({
      where: { id: roomId, propertyId: this.propertyId },
      data: { status, dataRetornoManutencao: null, updatedAt: now },
    })
    return this.getById(roomId).then(r => r.isOk ? r : Result.fail(new Error('ROOM_NOT_FOUND')))
  }

  private toData(q: Quarto): any {
    return {
      id: q.id,
      nome: q.nome,
      tipo: q.tipo,
      capacidadeMaxima: q.capacidadeMaxima,
      andar: q.andar,
      diariaBase: q.diariaBase.centavos,
      status: q.status,
      amenities: q.amenities,
      descricao: q.descricao ?? null,
      dataRetornoManutencao: q.dataRetornoManutencao ?? null,
    }
  }

  private hydrate(row: any): Quarto {
    const diaria = Money.create(row.diariaBase ?? 0)
    const result = Quarto.create({
      id: row.id,
      tipo: row.tipo as TipoQuarto,
      capacidadeMaxima: row.capacidadeMaxima ?? 2,
      andar: row.andar ?? 1,
      nome: row.nome,
      diariaBase: diaria.isOk ? diaria.value : Money.create(10000).value,
      amenities: row.amenities ?? [],
      descricao: row.descricao ?? undefined,
    })
    if (result.isFail) throw result.error
    const quarto = result.value
    if (row.status && row.status !== quarto['status']) {
      quarto['alterarStatus'](row.status as StatusQuarto)
    }
    return quarto
  }
}
