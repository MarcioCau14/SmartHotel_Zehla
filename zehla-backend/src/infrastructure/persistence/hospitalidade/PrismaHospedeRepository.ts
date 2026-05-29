import { PrismaClient } from '@prisma/client'
import { Result } from '../../../domain/shared/Result'
import { Hospede, CriarHospedeProps } from '../../../domain/hospitalidade/entities/Hospede'
import { Documento } from '../../../domain/hospitalidade/value-objects/Documento'
import { Email } from '../../../domain/hospitalidade/value-objects/Email'
import { IHospedePort } from '../../../application/hospitalidade/ports/IHospedePort'

export class PrismaHospedeRepository implements IHospedePort {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly propertyId: string
  ) {}

  async getById(guestId: string): Promise<Result<Hospede, Error>> {
    const row = await this.prisma.hospede.findUnique({ where: { id: guestId } })
    if (!row || row.propertyId !== this.propertyId) {
      return Result.fail(new Error('GUEST_NOT_FOUND'))
    }
    return Result.ok(this.hydrate(row))
  }

  async getByDocument(documentoValor: string): Promise<Result<Hospede, Error>> {
    const rows = await this.prisma.hospede.findMany({
      where: { documentoValor, propertyId: this.propertyId },
      take: 1,
    })
    if (rows.length === 0) return Result.fail(new Error('GUEST_NOT_FOUND'))
    return Result.ok(this.hydrate(rows[0]))
  }

  async search(query: string): Promise<Result<Hospede[], Error>> {
    const q = query.trim().toLowerCase()
    const rows = await this.prisma.hospede.findMany({
      where: {
        propertyId: this.propertyId,
        OR: [
          { nomeCompleto: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { telefone: { contains: q } },
          { documentoValor: { contains: q } },
        ],
      },
    })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async save(hospede: Hospede): Promise<Result<Hospede, Error>> {
    const data = this.toData(hospede)
    await this.prisma.hospede.upsert({
      where: { id: hospede.id },
      create: { ...data, propertyId: this.propertyId },
      update: data,
    })
    return Result.ok(hospede)
  }

  async delete(guestId: string): Promise<Result<void, Error>> {
    await this.prisma.hospede.deleteMany({
      where: { id: guestId, propertyId: this.propertyId },
    })
    return Result.ok(undefined)
  }

  private toData(h: Hospede): any {
    return {
      id: h.id,
      nomeCompleto: h.nomeCompleto,
      documentoTipo: h.documento.tipo,
      documentoValor: h.documento.valor,
      dataNascimento: h.dataNascimento,
      email: h.email?.valor ?? null,
      telefone: h.telefone ?? null,
      preferencias: h.preferencias ?? null,
      observacoes: h.observacoes ?? null,
    }
  }

  private hydrate(row: any): Hospede {
    const docResult = Documento.create(row.documentoValor ?? '', row.documentoTipo ?? 'cpf')
    const documento = docResult.isOk ? docResult.value : Documento.create('00000000000', 'cpf').value

    const email = row.email ? Email.create(row.email) : null
    const emailVal = email?.isOk ? email.value : undefined

    const result = Hospede.create({
      id: row.id,
      nomeCompleto: row.nomeCompleto,
      documento,
      dataNascimento: row.dataNascimento ?? new Date('2000-01-01'),
      email: emailVal,
      telefone: row.telefone ?? undefined,
      preferencias: row.preferencias ?? undefined,
    })
    if (result.isFail) throw result.error
    if (row.observacoes) {
      result.value['atualizar']({ observacoes: row.observacoes })
    }
    return result.value
  }
}
