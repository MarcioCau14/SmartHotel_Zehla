import { useState, useCallback, useEffect } from 'react'
import { Result } from '../shared/Result'
import { SalesServiceAdapter } from '../services/adapters/SalesServiceAdapter'

export type LeadStatus = 'prospect' | 'qualified' | 'trial' | 'negotiation' | 'converted' | 'churned' | 'reactivated'

export interface LeadCard {
  id: string
  nome: string
  status: LeadStatus
  score: number
  canal: string
  email?: string
  telefone?: string
}

const COLUMNS: LeadStatus[] = ['prospect', 'qualified', 'trial', 'negotiation', 'converted', 'churned', 'reactivated']

function emptyColumns(): Record<string, LeadCard[]> {
  const cols: Record<string, LeadCard[]> = {}
  for (const c of COLUMNS) cols[c] = []
  return cols
}

export function useLeadsKanban() {
  const [leads, setLeads] = useState<Record<string, LeadCard[]>>(emptyColumns())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    const adapter = new SalesServiceAdapter()
    const result = await adapter.listarLeads()
    setLoading(false)

    if (result.isFail) {
      setError(result.error.message)
      const fallback: LeadCard[] = [
        { id: 'lead-1', nome: 'Renato Porto', status: 'prospect', score: 30, canal: 'WhatsApp' },
        { id: 'lead-2', nome: 'Alice Medeiros', status: 'qualified', score: 85, canal: 'site' },
        { id: 'lead-3', nome: 'Gabriela Lima', status: 'negotiation', score: 55, canal: 'Booking' },
      ]
      organizeLeads(fallback)
      return
    }

    const fetchedLeads = (result.value.data?.leads || []) as LeadCard[]
    organizeLeads(fetchedLeads)
  }, [])

  const organizeLeads = (list: LeadCard[]) => {
    const columns = emptyColumns()
    list.forEach((item) => {
      const statusKey = item.status || 'prospect'
      if (columns[statusKey]) {
        columns[statusKey].push(item)
      }
    })
    setLeads(columns)
  }

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const moverLead = useCallback(
    async (leadId: string, novoStatus: LeadStatus): Promise<Result<void, Error>> => {
      setLeads((prev) => {
        let foundCard: LeadCard | undefined
        const nextState = { ...prev }

        Object.keys(nextState).forEach((key) => {
          const idx = nextState[key].findIndex((card) => card.id === leadId)
          if (idx !== -1) {
            foundCard = nextState[key][idx]
            nextState[key].splice(idx, 1)
          }
        })

        if (foundCard) {
          foundCard.status = novoStatus
          nextState[novoStatus] = [...nextState[novoStatus], foundCard]
        }

        return nextState
      })

      return Result.ok(undefined)
    },
    []
  )

  const qualificarLead = useCallback(
    async (leadId: string): Promise<Result<number, Error>> => {
      const adapter = new SalesServiceAdapter()
      const result = await adapter.qualificarLead(leadId)
      if (result.isFail) {
        return Result.fail(result.error)
      }

      const newScore = result.value.data?.score || 80
      setLeads((prev) => {
        const nextState = { ...prev }
        Object.keys(nextState).forEach((key) => {
          nextState[key] = nextState[key].map((card) =>
            card.id === leadId ? { ...card, score: newScore, status: 'qualified' } : card
          )
        })
        return nextState
      })
      return Result.ok(newScore)
    },
    []
  )

  return {
    leads,
    loading,
    error,
    moverLead,
    qualificarLead,
    refresh: fetchLeads,
  }
}
