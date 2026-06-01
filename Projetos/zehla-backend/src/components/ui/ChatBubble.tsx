'use client'

import { cn } from '@/lib/utils'

export interface ChatBubbleProps {
  messageId: string
  text: string
  timestamp: Date
  intent: string
  origem: string
  isUser?: boolean
  needsEscalation?: boolean
  confidenceScore?: number
  onEscalate?: () => void
}

export function ChatBubble({
  text,
  timestamp,
  intent,
  origem,
  isUser = false,
  needsEscalation = false,
  confidenceScore,
  onEscalate,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-all duration-300',
        needsEscalation
          ? 'border-red-500 bg-red-950/20 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]'
          : isUser
            ? 'border-orange-700 bg-orange-950/30 ml-12'
            : 'border-slate-700 bg-slate-800/40 mr-12',
      )}
    >
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-orange-400 border border-slate-700 font-mono text-[10px]">
            {intent}
          </span>
          <span className="text-slate-500">{origem}</span>
        </div>
        <span className="text-slate-500">{timestamp.toLocaleTimeString()}</span>
      </div>

      <p className="text-slate-200 text-sm leading-relaxed">{text}</p>

      {confidenceScore !== undefined && (
        <div className="mt-2 text-[10px] text-slate-500 font-mono">
          Confidence: {(confidenceScore * 100).toFixed(0)}%
        </div>
      )}

      {needsEscalation && (
        <div className="flex items-center justify-between mt-3 p-2 bg-red-950/40 rounded border border-red-900/60">
          <span className="text-xs text-red-400 font-bold">
            Intervenção Humana Necessária
          </span>
          {onEscalate && (
            <button
              onClick={onEscalate}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded transition-colors"
            >
              Assumir Conversa
            </button>
          )}
        </div>
      )}
    </div>
  )
}
