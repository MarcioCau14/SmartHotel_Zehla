import { Result } from '../../../shared/Result'
import { ICRMRepositoryPort } from '../../../domain/crm/ports/ICRMRepositoryPort'
import { CRMPipelineStage } from '../../../domain/crm/models/CRMPipelineStage'
import type { LeadProfile } from '../../../domain/crm/models/LeadProfile'

export interface LeadCardDTO {
  readonly id: string
  readonly nome: string
  readonly telefone: string
  readonly email: string | undefined
  readonly canalOrigem: string
  readonly ltvScore: number
  readonly stage: string
  readonly persona: string
  readonly tags: ReadonlyArray<string>
  readonly totalSpentUsd: number
  readonly daysSinceLastInteraction: number
  readonly isHighValue: boolean
}

export interface KanbanColumnDTO {
  readonly grupo: string
  readonly titulo: string
  readonly leads: ReadonlyArray<LeadCardDTO>
  readonly cor: string
}

export interface KanbanBoardDTO {
  readonly columns: ReadonlyArray<KanbanColumnDTO>
}

const GRUPO_META: Record<CRMPipelineStage, { titulo: string; grupo: string; cor: string }> = {
  [CRMPipelineStage.ENTRADA]: { titulo: 'Entrada', grupo: 'topo', cor: 'border-l-blue-500' },
  [CRMPipelineStage.QUALIFICACAO]: { titulo: 'Qualificação', grupo: 'qualificacao', cor: 'border-l-amber-500' },
  [CRMPipelineStage.PROPOSTA]: { titulo: 'Proposta', grupo: 'qualificacao', cor: 'border-l-amber-500' },
  [CRMPipelineStage.NEGOCIACAO]: { titulo: 'Negociação', grupo: 'negociacao', cor: 'border-l-orange-600' },
  [CRMPipelineStage.FECHAMENTO]: { titulo: 'Fechado', grupo: 'fechado', cor: 'border-l-emerald-600' },
  [CRMPipelineStage.PERDA_TEMPORARIA]: { titulo: 'Perda Temporária', grupo: 'fechado', cor: 'border-l-slate-400' },
}

function leadToCardDTO(lead: LeadProfile): LeadCardDTO {
  return Object.freeze({
    id: lead.id,
    nome: lead.nome,
    telefone: lead.telefone,
    email: lead.email,
    canalOrigem: lead.canalOrigem,
    ltvScore: lead.ltvScore,
    stage: lead.stage,
    persona: lead.persona,
    tags: lead.tags,
    totalSpentUsd: lead.totalSpentUsd,
    daysSinceLastInteraction: lead.daysSinceLastInteraction,
    isHighValue: lead.isHighValue,
  })
}

export class GetLeadsKanbanUseCase {
  constructor(private readonly repo: ICRMRepositoryPort) {}

  async execute(propertyId: string): Promise<Result<KanbanBoardDTO, Error>> {
    const stages = Object.values(CRMPipelineStage)
    const allLeads: LeadProfile[] = []

    for (const stage of stages) {
      const result = await this.repo.listarLeadsPorStage(stage)
      if (result.isFail) return Result.fail(result.error)
      allLeads.push(...result.value)
    }

    const propertyLeads = allLeads.filter((l) => l.propriedadeId === propertyId)

    const groups = new Map<string, LeadCardDTO[]>()
    for (const meta of Object.values(GRUPO_META)) {
      if (!groups.has(meta.grupo)) groups.set(meta.grupo, [])
    }

    for (const lead of propertyLeads) {
      const meta = GRUPO_META[lead.stage as CRMPipelineStage] ?? GRUPO_META[CRMPipelineStage.ENTRADA]
      const col = groups.get(meta.grupo)!
      col.push(leadToCardDTO(lead))
    }

    const seenGrupos = new Set<string>()
    const columns: KanbanColumnDTO[] = Object.values(GRUPO_META)
      .filter((m) => {
        if (seenGrupos.has(m.grupo)) return false
        seenGrupos.add(m.grupo)
        return true
      })
      .map((meta) =>
        Object.freeze({
          grupo: meta.grupo,
          titulo: meta.titulo,
          leads: Object.freeze(groups.get(meta.grupo) ?? []),
          cor: meta.cor,
        }),
      )

    return Result.ok(Object.freeze({ columns: Object.freeze(columns) }))
  }
}
