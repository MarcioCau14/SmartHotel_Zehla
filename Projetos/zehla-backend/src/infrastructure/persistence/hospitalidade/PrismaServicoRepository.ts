import { PrismaClient } from '@prisma/client'
import { Result } from '../../../domain/shared/Result'
import { Servico } from '../../../domain/hospitalidade/entities/Servico'
import { CategoriaServico } from '../../../domain/hospitalidade/entities/CategoriaServico'
import { Money } from '../../../domain/hospitalidade/value-objects/Money'
import { IServicoPort } from '../../../application/hospitalidade/ports/IServicoPort'

export class PrismaServicoRepository implements IServicoPort {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly propertyId: string
  ) {}

  async getById(serviceId: string): Promise<Result<Servico, Error>> {
    const row = await this.prisma.servicoHosp.findUnique({ where: { id: serviceId } })
    if (!row || row.propertyId !== this.propertyId) {
      return Result.fail(new Error('SERVICE_NOT_FOUND'))
    }
    return Result.ok(this.hydrate(row))
  }

  async listAvailable(): Promise<Result<Servico[], Error>> {
    const rows = await this.prisma.servicoHosp.findMany({
      where: { propertyId: this.propertyId, disponivel: true },
    })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async listByCategoria(categoria: CategoriaServico): Promise<Result<Servico[], Error>> {
    const rows = await this.prisma.servicoHosp.findMany({
      where: { propertyId: this.propertyId, categoria },
    })
    return Result.ok(rows.map(r => this.hydrate(r)))
  }

  async save(servico: Servico): Promise<Result<Servico, Error>> {
    const data = this.toData(servico)
    await this.prisma.servicoHosp.upsert({
      where: { id: servico.id },
      create: { ...data, propertyId: this.propertyId },
      update: data,
    })
    return Result.ok(servico)
  }

  private toData(s: Servico): any {
    return {
      id: s.id,
      nome: s.nome,
      descricao: s.descricao ?? null,
      preco: s.precoAtual.centavos,
      categoria: s.categoria,
      disponivel: s.disponivel,
    }
  }

  private hydrate(row: any): Servico {
    const preco = Money.create(row.preco ?? 0)
    const result = Servico.create({
      id: row.id,
      nome: row.nome,
      descricao: row.descricao ?? undefined,
      preco: preco.isOk ? preco.value : Money.create(100).value,
      categoria: (row.categoria as CategoriaServico) ?? CategoriaServico.OUTRO,
    })
    if (result.isFail) throw result.error
    const servico = result.value
    if (!row.disponivel) servico.desativar()
    return servico
  }
}
