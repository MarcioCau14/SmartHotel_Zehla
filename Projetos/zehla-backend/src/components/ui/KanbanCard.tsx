'use client'

import { cn } from '@/lib/utils'

export interface KanbanCardProps {
  leadName: string
  score: number
  origem: string
  estado: string
  grupo: string
  diasSemInteracao: number
  icpFit: string
  onQualificar?: () => void
  onHandoff?: () => void
  onVerEscada?: () => void
}

function getBorderColor(score: number): string {
  if (score >= 70) return 'border-l-emerald-500'
  if (score >= 30) return 'border-l-orange-500'
  return 'border-l-slate-600'
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400'
  if (score >= 30) return 'text-orange-400'
  return 'text-slate-400'
}

const ACOES_POR_GRUPO: Record<string, { label: string; action: keyof KanbanCardProps }[]> = {
  topo: [{ label: 'Qualificar', action: 'onQualificar' }],
  agendamento: [{ label: 'Handoff', action: 'onHandoff' }],
  negociacao: [{ label: 'Ver Escada', action: 'onVerEscada' }],
}

export function KanbanCard({
  leadName,
  score,
  origem,
  estado,
  grupo,
  diasSemInteracao,
  icpFit,
  onQualificar,
  onHandoff,
  onVerEscada,
}: KanbanCardProps) {
  const acoes = ACOES_POR_GRUPO[grupo] ?? []

  return (
    <div
      className={cn(
        'p-3 bg-slate-800 rounded-lg border border-slate-700 shadow-md flex flex-col gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg',
        'border-l-4',
        getBorderColor(score),
      )}
    >
      <div className="flex justify-between items-start gap-1">
        <span className="font-bold text-slate-100 text-sm truncate max-w-[140px]">
          {leadName || 'Lead sem nome'}
        </span>
        <span
          className={cn(
            'text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700',
            getScoreColor(score),
          )}
        >
          {score}/100
        </span>
      </div>

      <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
          {origem || 'N/A'}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
          ICP: {icpFit}
        </span>
        {diasSemInteracao > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
            {diasSemInteracao}d inativo
          </span>
        )}
      </div>

      <div className="flex items-center text-[10px] text-slate-500">
        <span className="capitalize">{estado.replace(/_/g, ' ')}</span>
      </div>

      {acoes.length > 0 && (
        <div className="flex gap-1.5 mt-1 border-t border-slate-700/60 pt-2">
          {acoes.map(({ label, action }) => {
            const handler = { onQualificar, onHandoff, onVerEscada }[action]
            if (!handler) return null
            return (
              <button
                key={action}
                onClick={handler}
                className="flex-1 py-1 bg-slate-700 hover:bg-orange-600 hover:text-white text-slate-300 text-[10px] font-bold rounded transition-colors"
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
