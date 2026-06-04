import { prisma } from '@/lib/prisma'
import { CRMPipelineStage, ICPersona } from '../../../domain/crm/models/CRMPipelineStage'
import { LeadProfile } from '../../../domain/crm/models/LeadProfile'
import { InteractionRecord } from '../../../domain/crm/models/InteractionRecord'
import type { ICRMRepositoryPort } from '../../../domain/crm/ports/ICRMRepositoryPort'
import { Result } from '../../../shared/Result'

export class PrismaCRMRepository implements ICRMRepositoryPort {
  async salvarLead(lead: LeadProfile): Promise<Result<LeadProfile, Error>> {
    try {
      const data = this.toData(lead)
      const row = await prisma.comercialLead.upsert({
        where: { id: lead.id },
        create: data,
        update: data,
      })
      return this.hydrate(row)
    } catch (err) {
      return Result.fail(err instanceof Error ? err : new Error('Falha ao salvar lead'))
    }
  }

  async buscarLeadPorId(id: string): Promise<Result<LeadProfile | null, Error>> {
    try {
      const row = await prisma.comercialLead.findUnique({
        where: { id },
        include: { interactions: { orderBy: { timestamp: 'desc' }, take: 5 } },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (err) {
      return Result.fail(err instanceof Error ? err : new Error('Falha ao buscar lead'))
    }
  }

  async buscarLeadPorTelefone(telefone: string): Promise<Result<LeadProfile | null, Error>> {
    try {
      const row = await prisma.comercialLead.findFirst({
        where: { telefone },
        include: { interactions: { orderBy: { timestamp: 'desc' }, take: 5 } },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (err) {
      return Result.fail(err instanceof Error ? err : new Error('Falha ao buscar lead por telefone'))
    }
  }

  async listarLeadsPorStage(stage: CRMPipelineStage): Promise<Result<LeadProfile[], Error>> {
    try {
      const rows = await prisma.comercialLead.findMany({
        where: { pipelineStage: stage },
        include: { interactions: { orderBy: { timestamp: 'desc' }, take: 1 } },
      })
      const results: LeadProfile[] = []
      for (const row of rows) {
        const hydrated = this.hydrate(row)
        if (hydrated.isOk) results.push(hydrated.value)
      }
      return Result.ok(results)
    } catch (err) {
      return Result.fail(err instanceof Error ? err : new Error('Falha ao listar leads por stage'))
    }
  }

  async registrarInteracao(record: InteractionRecord): Promise<Result<InteractionRecord, Error>> {
    try {
      await prisma.crmLeadInteraction.create({
        data: {
          id: record.id,
          leadId: record.leadId,
          canal: record.canal,
          timestamp: record.timestamp,
          sentimentScore: record.sentimentScore,
          tokenCost: record.tokenCost,
          outcome: record.outcome,
          resumo: record.resumo,
        },
      })
      return Result.ok(record)
    } catch (err) {
      return Result.fail(err instanceof Error ? err : new Error('Falha ao registrar interação'))
    }
  }

  async listarInteracoesPorLead(leadId: string): Promise<Result<InteractionRecord[], Error>> {
    try {
      const rows = await prisma.crmLeadInteraction.findMany({
        where: { leadId },
        orderBy: { timestamp: 'desc' },
      })
      const records: InteractionRecord[] = []
      for (const row of rows) {
        const result = InteractionRecord.create({
          id: row.id,
          leadId: row.leadId,
          canal: row.canal,
          timestamp: row.timestamp,
          sentimentScore: row.sentimentScore,
          tokenCost: row.tokenCost,
          outcome: row.outcome as 'CONVERTED' | 'LOST' | 'PENDING',
          resumo: row.resumo ?? undefined,
        })
        if (result.isOk) records.push(result.value)
      }
      return Result.ok(records)
    } catch (err) {
      return Result.fail(err instanceof Error ? err : new Error('Falha ao listar interações'))
    }
  }

  async atualizarStage(leadId: string, stage: CRMPipelineStage): Promise<Result<LeadProfile, Error>> {
    try {
      const row = await prisma.comercialLead.update({
        where: { id: leadId },
        data: { pipelineStage: stage },
        include: { interactions: { orderBy: { timestamp: 'desc' }, take: 5 } },
      })
      return this.hydrate(row)
    } catch (err) {
      return Result.fail(err instanceof Error ? err : new Error('Falha ao atualizar stage'))
    }
  }

  private toData(lead: LeadProfile): {
    id: string; canal: string; propriedadeId: string; dataCaptura: Date;
    nome: string; email: string | null; telefone: string; score: number;
    status: string; tags: string | null; ultimaInteracao: Date;
    pipelineStage: string; ltvScore: number; persona: string;
    totalSpentUsd: number; staysCount: number;
    bookingValueUsd: number | null; assignedCloserId: string | null;
  } {
    return {
      id: lead.id,
      canal: lead.canalOrigem,
      propriedadeId: lead.propriedadeId,
      dataCaptura: lead.createdAt,
      nome: lead.nome,
      email: lead.email ?? null,
      telefone: lead.telefone,
      score: lead.ltvScore,
      status: lead.stage,
      tags: lead.tags.length > 0 ? JSON.stringify([...lead.tags]) : null,
      ultimaInteracao: lead.lastInteractionAt,
      pipelineStage: lead.stage,
      ltvScore: lead.ltvScore,
      persona: lead.persona as string,
      totalSpentUsd: lead.totalSpentUsd,
      staysCount: lead.staysCount,
      bookingValueUsd: lead.bookingValueUsd,
      assignedCloserId: lead.assignedCloserId,
    }
  }

  private hydrate(row: Record<string, unknown> & { interactions?: Array<Record<string, unknown>> }): Result<LeadProfile, Error> {
    return LeadProfile.create({
      id: String(row.id),
      nome: String(row.nome ?? ''),
      telefone: String(row.telefone ?? ''),
      email: row.email ? String(row.email) : undefined,
      canalOrigem: String(row.canal),
      ltvScore: Number(row.ltvScore ?? row.score ?? 0),
      stage: (row.pipelineStage as CRMPipelineStage) ?? CRMPipelineStage.ENTRADA,
      createdAt: row.dataCaptura as Date,
      propriedadeId: String(row.propriedadeId),
      persona: (row.persona as ICPersona) ?? undefined,
      totalSpentUsd: Number(row.totalSpentUsd ?? 0),
      staysCount: Number(row.staysCount ?? 0),
      lastInteractionAt: (row.ultimaInteracao as Date) ?? new Date(),
      bookingValueUsd: row.bookingValueUsd ? Number(row.bookingValueUsd) : null,
      assignedCloserId: row.assignedCloserId ? String(row.assignedCloserId) : null,
      tags: row.tags ? this.parseTags(String(row.tags)) : undefined,
      updatedAt: row.updatedAt as Date | undefined,
    })
  }

  private parseTags(raw: string): string[] {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  }
}
