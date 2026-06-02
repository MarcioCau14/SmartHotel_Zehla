import { useState, useCallback } from 'react'
import { Result } from '../shared/Result'
import { apiPost, apiGet } from './apiClient'

export type EstadoLead =
  | 'entrada' | 'primeira_interacao' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3'
  | 'agendado' | 'reagendado' | 'no_show' | 'transferido_sdr'
  | 'em_negociacao' | 'venda_sinal' | 'venda_concluida'
  | 'perdido' | 'em_onboarding' | 'acompanhamento' | 'renovacao' | 'sales_farming'

export type GrupoFunil =
  | 'topo' | 'qualificacao' | 'agendamento' | 'negociacao' | 'fechado' | 'perdido' | 'farming'

const ESTADO_PARA_GRUPO: Record<EstadoLead, GrupoFunil> = {
  entrada: 'topo',
  primeira_interacao: 'topo',
  follow_up_1: 'qualificacao',
  follow_up_2: 'qualificacao',
  follow_up_3: 'qualificacao',
  agendado: 'agendamento',
  reagendado: 'agendamento',
  no_show: 'perdido',
  transferido_sdr: 'negociacao',
  em_negociacao: 'negociacao',
  venda_sinal: 'fechado',
  venda_concluida: 'fechado',
  perdido: 'perdido',
  em_onboarding: 'fechado',
  acompanhamento: 'fechado',
  renovacao: 'fechado',
  sales_farming: 'farming',
}

const GRUPOS: GrupoFunil[] = ['topo', 'qualificacao', 'agendamento', 'negociacao', 'fechado', 'perdido', 'farming']

export interface LeadCard {
  id: string
  nome: string
  estado: EstadoLead
  grupo: GrupoFunil
  score: number
  icpFit: 'ideal' | 'minimo' | 'fora_icp'
  origem: string
  ultimaInteracao: Date | null
  diasSemInteracao: number
  tierAtual: string
  canal: string
  status: string
}

export interface SummaryPackage {
  score: number
  icpFit: string
  objecoes: string[]
  respostas: string[]
  gatilho: string
}

export interface RecomendacaoEscada {
  tipoRecomendacao: 'upsell' | 'cross_sell' | 'downsell' | 'manter' | 'isca'
  tierRecomendado: string
  justificativa: string
  confidenceScore: number
}

interface QualificarResponse {
  success: boolean
  data: { id: string; estado: EstadoLead }
}

interface HandoffResponse {
  success: boolean
  data: { id: string; estado: EstadoLead; closerResponsavel: string }
}

interface EscadaResponse {
  success: boolean
  data: RecomendacaoEscada
}

function estadoParaGrupo(estado: EstadoLead): GrupoFunil {
  return ESTADO_PARA_GRUPO[estado] ?? 'topo'
}

function colunasVazias(): Record<GrupoFunil, LeadCard[]> {
  return {
    topo: [],
    qualificacao: [],
    agendamento: [],
    negociacao: [],
    fechado: [],
    perdido: [],
    farming: [],
  }
}

export function useLeadsKanban() {
  const [leads, setLeads] = useState<Record<GrupoFunil, LeadCard[]>>(colunasVazias)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const organizarLeads = useCallback((lista: LeadCard[]) => {
    const cols = colunasVazias()
    for (const card of lista) {
      const grupo = estadoParaGrupo(card.estado)
      cols[grupo].push(card)
    }
    setLeads(cols)
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await apiGet<{ leads: LeadCard[] }>('/api/comercial/leads')
      if (result.isFail) {
        setError(result.error.message)
      } else {
        organizarLeads(result.value.leads)
      }
    } catch {
      setError('Erro ao carregar leads')
    } finally {
      setIsLoading(false)
    }
  }, [organizarLeads])

  const qualificarLead = useCallback(async (leadId: string): Promise<Result<LeadCard, Error>> => {
    const result = await apiPost<QualificarResponse>(`/api/comercial/leads/${leadId}/qualificar`)
    if (result.isFail) return Result.fail(result.error)

    const { data } = result.value
    const card: LeadCard = {
      id: data.id,
      nome: '',
      estado: data.estado,
      grupo: estadoParaGrupo(data.estado),
      score: 0,
      icpFit: 'fora_icp',
      origem: '',
      ultimaInteracao: null,
      diasSemInteracao: 0,
      tierAtual: 'front_end',
      canal: 'website',
      status: 'novo',
    }

    setLeads((prev) => {
      const cols = { ...prev }
      for (const g of GRUPOS) {
        cols[g] = cols[g].filter((l) => l.id !== leadId)
      }
      cols[card.grupo] = [...cols[card.grupo], card]
      return cols
    })

    return Result.ok(card)
  }, [])

  const realizarHandoff = useCallback(async (
    leadId: string,
    closerId: string,
    summaryPackage: SummaryPackage,
  ): Promise<Result<LeadCard, Error>> => {
    const result = await apiPost<HandoffResponse>(`/api/comercial/leads/${leadId}/handoff`, {
      closerId,
      summaryPackage,
    })
    if (result.isFail) return Result.fail(result.error)

    const { data } = result.value
    const card: LeadCard = {
      id: data.id,
      nome: '',
      estado: data.estado,
      grupo: estadoParaGrupo(data.estado),
      score: 0,
      icpFit: 'fora_icp',
      origem: '',
      ultimaInteracao: null,
      diasSemInteracao: 0,
      tierAtual: 'front_end',
      canal: 'website',
      status: 'novo',
    }

    setLeads((prev) => {
      const cols = { ...prev }
      for (const g of GRUPOS) {
        cols[g] = cols[g].filter((l) => l.id !== leadId)
      }
      cols[card.grupo] = [...cols[card.grupo], card]
      return cols
    })

    return Result.ok(card)
  }, [])

  const calcularEscada = useCallback(async (
    leadId: string,
    tierAtual: string,
  ): Promise<Result<RecomendacaoEscada, Error>> => {
    const result = await apiGet<EscadaResponse>(
      `/api/comercial/leads/${leadId}/escada-valor?tierAtual=${encodeURIComponent(tierAtual)}`,
    )
    if (result.isFail) return Result.fail(result.error)
    return Result.ok(result.value.data)
  }, [])

  return {
    leads,
    isLoading,
    error,
    qualificarLead,
    realizarHandoff,
    calcularEscada,
    refresh,
  }
}
