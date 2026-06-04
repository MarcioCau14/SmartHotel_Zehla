import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch, apiPost } from '@/lib/api/api-client'
import { API } from '@/lib/api/api-routes'
import { GRUPO_FUNIL, GRUPO_META } from '@/types/lead'
import type { GrupoFunil, LeadCardView, KanbanBoardView, KanbanColumnView } from '@/types/lead'

const LEADS_KEY = ['crm', 'leads'] as const

function organizeByStage(leads: LeadCardView[]): KanbanBoardView {
  const groups = new Map<GrupoFunil, LeadCardView[]>()
  for (const grupo of Object.values(GRUPO_FUNIL)) {
    groups.set(grupo, [])
  }

  for (const lead of leads) {
    const grupo = lead.stage === 'ENTRADA' ? GRUPO_FUNIL.TOPO
      : lead.stage === 'QUALIFICACAO' || lead.stage === 'PROPOSTA' ? GRUPO_FUNIL.QUALIFICACAO
      : lead.stage === 'NEGOCIACAO' ? GRUPO_FUNIL.NEGOCIACAO
      : GRUPO_FUNIL.FECHADO
    const col = groups.get(grupo)
    if (col) col.push(lead)
  }

  const columns: KanbanColumnView[] = Object.values(GRUPO_FUNIL).map((grupo) => {
    const meta = GRUPO_META[grupo]
    return Object.freeze({
      grupo,
      titulo: meta.titulo,
      leads: Object.freeze(groups.get(grupo) ?? []),
      cor: meta.cor,
    })
  })

  return Object.freeze({ columns: Object.freeze(columns) })
}

export function useLeadsKanban() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: LEADS_KEY,
    queryFn: async () => {
      const result = await apiGet<LeadCardView[]>(API.CRM.LEADS)
      if (result.isFail) throw result.error
      return organizeByStage(result.getOrThrow())
    },
    staleTime: 1000 * 60 * 2,
    retry: 2,
  })

  const moveLead = useMutation({
    mutationFn: async ({ leadId, newStage }: { leadId: string; newStage: string }) => {
      const result = await apiPatch<LeadCardView>(API.CRM.LEAD_BY_ID(leadId) + '/stage', { stage: newStage })
      if (result.isFail) throw result.error
      return result.getOrThrow()
    },
    onMutate: async ({ leadId, newStage }) => {
      await queryClient.cancelQueries({ queryKey: LEADS_KEY })
      const previousBoard = queryClient.getQueryData<KanbanBoardView>(LEADS_KEY)

      queryClient.setQueryData<KanbanBoardView>(LEADS_KEY, (old) => {
        if (!old) return old
        const movedLead: LeadCardView | undefined = (() => {
          for (const col of old.columns) {
            const found = col.leads.find((l) => l.id === leadId)
            if (found) return found
          }
          return undefined
        })()
        if (!movedLead) return old

        const updatedColumns = old.columns.map((col) => {
          const filtered = col.leads.filter((l) => l.id !== leadId)
          const novoGrupo = newStage === 'ENTRADA' ? GRUPO_FUNIL.TOPO
            : newStage === 'QUALIFICACAO' || newStage === 'PROPOSTA' ? GRUPO_FUNIL.QUALIFICACAO
            : newStage === 'NEGOCIACAO' ? GRUPO_FUNIL.NEGOCIACAO
            : GRUPO_FUNIL.FECHADO

          if (col.grupo === novoGrupo) {
            return Object.freeze({
              ...col,
              leads: Object.freeze([...filtered, { ...movedLead, stage: newStage }]),
            })
          }
          return Object.freeze({ ...col, leads: Object.freeze(filtered) })
        })

        return Object.freeze({ columns: Object.freeze(updatedColumns) })
      })

      return { previousBoard }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(LEADS_KEY, context.previousBoard)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY })
    },
  })

  const qualifyLead = useMutation({
    mutationFn: async (leadId: string) => {
      const result = await apiPost<LeadCardView>(API.CRM.QUALIFICAR(leadId))
      if (result.isFail) throw result.error
      return result.getOrThrow()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_KEY })
    },
  })

  return {
    board: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
    moveLead: (leadId: string, grupoDestino: GrupoFunil) => {
      const stageMap: Record<GrupoFunil, string> = {
        [GRUPO_FUNIL.TOPO]: 'ENTRADA',
        [GRUPO_FUNIL.QUALIFICACAO]: 'QUALIFICACAO',
        [GRUPO_FUNIL.NEGOCIACAO]: 'NEGOCIACAO',
        [GRUPO_FUNIL.FECHADO]: 'FECHAMENTO',
      }
      moveLead.mutate({ leadId, newStage: stageMap[grupoDestino] })
    },
    qualifyLead: qualifyLead.mutate,
    isMoving: moveLead.isPending,
    isQualifying: qualifyLead.isPending,
  }
}
