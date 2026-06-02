import { PrismaClient } from '@prisma/client'
import { Result } from '../../../shared/Result'
import { IComercialLeadPort } from '../../../application/comercial/ports/IComercialLeadPort'
import { ComercialLead, EstadoLead } from '../../../domain/comercial/entities/ComercialLead'
import { OrigemLead } from '../../../domain/comercial/value-objects/OrigemLead'
import { LeadScore } from '../../../domain/comercial/value-objects/LeadScore'
import { Email } from '../../../domain/comercial/value-objects/Email'
import { Documento } from '../../../domain/comercial/value-objects/Documento'

export class PrismaComercialLeadRepository implements IComercialLeadPort {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorId(id: string): Promise<Result<ComercialLead | null, Error>> {
    try {
      const row = await this.prisma.comercialLead.findUnique({ where: { id } })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar lead comercial'))
    }
  }

  async listarPorEstado(estado: EstadoLead): Promise<Result<ComercialLead[], Error>> {
    try {
      const rows = await this.prisma.comercialLead.findMany({ where: { status: estado } })
      const leads: ComercialLead[] = []
      for (const row of rows) {
        const result = this.hydrate(row)
        if (result.isOk && result.value) leads.push(result.value)
      }
      return Result.ok(leads)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar leads por estado'))
    }
  }

  async salvar(lead: ComercialLead): Promise<Result<ComercialLead, Error>> {
    try {
      const data = this.toData(lead)
      await this.prisma.comercialLead.upsert({
        where: { id: data.id as string },
        create: data as any,
        update: data as any,
      })
      return Result.ok(lead)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao salvar lead comercial'))
    }
  }

  private toData(lead: ComercialLead): Record<string, unknown> {
    return {
      id: lead.id,
      canal: lead.origem.canal,
      propriedadeId: lead.propriedadeId,
      dataCaptura: new Date(),
      nome: lead.nome ?? null,
      email: lead.email?.valor ?? null,
      telefone: lead.telefone ?? null,
      documento: lead.documento?.valor ?? null,
      documentoTipo: lead.documento?.tipo ?? null,
      score: lead.score?.valor ?? null,
      status: lead.estado,
      origemUrl: lead.origemUrl ?? null,
      tags: lead.tags?.join(',') ?? null,
      ultimaInteracao: lead.ultimaInteracao ?? null,
    }
  }

  private hydrate(row: Record<string, unknown>): Result<ComercialLead, Error> {
    try {
      const origemResult = OrigemLead.criar(row.canal as string)
      if (origemResult.isFail) return Result.fail(origemResult.error)

      let score: LeadScore | undefined
      if (row.score != null) {
        const scoreResult = LeadScore.criar(row.score as number)
        if (scoreResult.isOk) score = scoreResult.value
      }

      let email: Email | undefined
      if (row.email) {
        const emailResult = Email.criar(row.email as string)
        if (emailResult.isOk) email = emailResult.value
      }

      let documento: Documento | undefined
      if (row.documento) {
        const documentoResult = Documento.criar(
          row.documento as string,
          (row.documentoTipo as string) ?? 'CPF',
        )
        if (documentoResult.isOk) documento = documentoResult.value
      }

      const tags = typeof row.tags === 'string' && row.tags.length > 0
        ? (row.tags as string).split(',').map(t => t.trim())
        : undefined

      const lead = ComercialLead.restore({
        id: row.id as string,
        origem: origemResult.value,
        propriedadeId: row.propriedadeId as string,
        nome: (row.nome as string) ?? undefined,
        email,
        telefone: (row.telefone as string) ?? undefined,
        documento,
        score,
        estado: (row.status as EstadoLead) ?? 'entrada',
        tags,
        origemUrl: (row.origemUrl as string) ?? undefined,
        ultimaInteracao: row.ultimaInteracao ? new Date(row.ultimaInteracao as string) : undefined,
      })

      return Result.ok(lead)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar lead comercial'))
    }
  }
}
