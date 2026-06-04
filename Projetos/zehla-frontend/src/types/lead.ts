export const GRUPO_FUNIL = {
  TOPO: 'topo',
  QUALIFICACAO: 'qualificacao',
  NEGOCIACAO: 'negociacao',
  FECHADO: 'fechado',
} as const

export type GrupoFunil = (typeof GRUPO_FUNIL)[keyof typeof GRUPO_FUNIL]

export const CANAIS_ORIGEM = [
  'instagram',
  'facebook',
  'whatsapp',
  'website',
  'indicacao',
  'email',
  'telefone',
  'booking',
] as const

export type CanalOrigem = (typeof CANAIS_ORIGEM)[number]

export interface LeadCardView {
  readonly id: string
  readonly nome: string
  readonly telefone: string
  readonly email?: string
  readonly canalOrigem: string
  readonly ltvScore: number
  readonly stage: string
  readonly persona: string
  readonly tags: ReadonlyArray<string>
  readonly totalSpentUsd: number
  readonly daysSinceLastInteraction: number
  readonly isHighValue: boolean
}

export interface KanbanColumnView {
  readonly grupo: GrupoFunil
  readonly titulo: string
  readonly leads: ReadonlyArray<LeadCardView>
  readonly cor: string
}

export interface KanbanBoardView {
  readonly columns: ReadonlyArray<KanbanColumnView>
}

export const GRUPO_META: Record<GrupoFunil, { titulo: string; cor: string }> = {
  [GRUPO_FUNIL.TOPO]: { titulo: 'Entrada', cor: 'border-l-blue-500' },
  [GRUPO_FUNIL.QUALIFICACAO]: { titulo: 'Qualificação', cor: 'border-l-amber-500' },
  [GRUPO_FUNIL.NEGOCIACAO]: { titulo: 'Negociação', cor: 'border-l-orange-600' },
  [GRUPO_FUNIL.FECHADO]: { titulo: 'Fechado', cor: 'border-l-emerald-600' },
}

export function ltvColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400'
  if (score >= 40) return 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400'
  return 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
}

export function ltvLabel(score: number): string {
  if (score >= 70) return 'Alto'
  if (score >= 40) return 'Médio'
  return 'Baixo'
}
