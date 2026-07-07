import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch } from '@/lib/api/api-client'
import { API } from '@/lib/api/api-routes'
import { GRUPO_FUNIL } from '@/types/lead'
import type { GrupoFunil, LeadCardView, KanbanBoardView } from '@/types/lead'

const LEADS_KEY = ['crm', 'leads'] as const

export function useLeadsKanban() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: LEADS_KEY,
    queryFn: async () => {
      const result = await apiGet<KanbanBoardView>(API.CRM.LEADS)
      if (result.isFail) throw result.error
      return result.getOrThrow()
    },
    staleTime: 1000 * 60 * 2,
    retry: 2,
  })

  const moveLead = useMutation({
    mutationFn: async ({ leadId, newStage }: { leadId: string; newStage: string }) => {
      const result = await apiPatch<{ id: string; stage: string }>(API.CRM.MOVE_LEAD, { leadId, stage: newStage })
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
      const result = await apiPatch<{ id: string; stage: string }>(API.CRM.MOVE_LEAD, { leadId, stage: 'QUALIFICACAO' })
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
