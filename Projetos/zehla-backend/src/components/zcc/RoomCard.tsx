'use client'

import { cn } from '@/lib/utils'
import type { RoomOperationalStatus } from '../../hooks/useRoomsGrid'

export interface RoomCardProps {
  roomId: string
  numero: string
  tipo: string
  status: RoomOperationalStatus
  preco: number
  hospede?: string
  onStatusChange?: (roomId: string, novoStatus: RoomOperationalStatus) => void
}

const STATUS_CONFIG: Record<RoomOperationalStatus, {
  cor: string
  corBg: string
  label: string
  acao: string | null
  acaoDestino: RoomOperationalStatus | null
}> = {
  LIVRE: {
    cor: 'border-emerald-500 text-emerald-400',
    corBg: 'bg-emerald-950/20',
    label: 'Livre',
    acao: null,
    acaoDestino: null,
  },
  OCUPADO: {
    cor: 'border-red-500 text-red-400',
    corBg: 'bg-red-950/20',
    label: 'Ocupado',
    acao: 'Solicitar Limpeza',
    acaoDestino: 'AGUARDANDO_LIMPEZA',
  },
  AGUARDANDO_LIMPEZA: {
    cor: 'border-amber-500 text-amber-400',
    corBg: 'bg-amber-950/20',
    label: 'Aguardando Limpeza',
    acao: 'Limpar Quarto',
    acaoDestino: 'LIVRE',
  },
  EM_MANUTENCAO: {
    cor: 'border-purple-500 text-purple-400',
    corBg: 'bg-purple-950/20',
    label: 'Em Manutenção',
    acao: 'Finalizar Manutenção',
    acaoDestino: 'LIVRE',
  },
}

export function RoomCard({
  roomId,
  numero,
  tipo,
  status,
  preco,
  hospede,
  onStatusChange,
}: RoomCardProps) {
  const cfg = STATUS_CONFIG[status]

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 shadow-md flex flex-col gap-3 transition-all hover:-translate-y-0.5',
        cfg.corBg,
        cfg.cor.split(' ')[0],
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('text-lg font-bold', cfg.cor.split(' ')[1])}>
            {numero}
          </span>
          <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
            {tipo}
          </span>
        </div>
        <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full', cfg.corBg, cfg.cor.split(' ')[1])}>
          {cfg.label}
        </span>
      </div>

      <div className="text-xs text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Preço base:</span>
          <span className="text-slate-300 font-mono">R$ {preco.toFixed(2)}</span>
        </div>
        {hospede && (
          <div className="flex justify-between">
            <span>Hóspede:</span>
            <span className="text-slate-300">{hospede}</span>
          </div>
        )}
      </div>

      {cfg.acao && onStatusChange && cfg.acaoDestino && (
        <button
          onClick={() => onStatusChange(roomId, cfg.acaoDestino!)}
          className={cn(
            'w-full py-1.5 text-xs font-bold rounded transition-colors',
            status === 'AGUARDANDO_LIMPEZA'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-slate-700 hover:bg-orange-600 hover:text-white text-slate-300',
          )}
        >
          {cfg.acao}
        </button>
      )}
    </div>
  )
}
