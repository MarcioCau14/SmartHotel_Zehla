'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { NIVEL_COR, AGENTE_COR } from '@/types/brain'
import type { LogEntry } from '@/types/brain'

interface CognitiveTerminalProps {
  readonly logs: ReadonlyArray<LogEntry>
  readonly isProcessing: boolean
  readonly onCommandSubmit: (cmd: string) => void
  readonly title?: string
}

export function CognitiveTerminal({
  logs,
  isProcessing,
  onCommandSubmit,
  title = 'Cognitive Terminal',
}: CognitiveTerminalProps) {
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = command.trim()
      if (!trimmed) return
      setHistory((prev) => [...prev, trimmed])
      setHistoryIndex(-1)
      onCommandSubmit(trimmed)
      setCommand('')
    },
    [command, onCommandSubmit],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (history.length === 0) return
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCommand(history[newIndex])
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (historyIndex === -1) return
        const newIndex = historyIndex + 1
        if (newIndex >= history.length) {
          setHistoryIndex(-1)
          setCommand('')
        } else {
          setHistoryIndex(newIndex)
          setCommand(history[newIndex])
        }
      }
    },
    [history, historyIndex],
  )

  return (
    <div
      data-slot="cognitive-terminal"
      className="flex flex-col overflow-hidden rounded-xl border bg-slate-950 font-mono text-xs"
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <span className="text-slate-400">{title}</span>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              processing
            </span>
          )}
          <span className="text-slate-600">v{ZEHLA_TERMINAL_VERSION}</span>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-4" style={{ maxHeight: '480px' }}>
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 leading-relaxed">
            <span className="shrink-0 text-slate-600">{log.timestamp}</span>
            <span className={`shrink-0 ${AGENTE_COR[log.agent] ?? 'text-slate-300'}`}>
              [{log.agent}]
            </span>
            <span className={`shrink-0 ${NIVEL_COR[log.level]}`}>
              {log.level.toUpperCase()}
            </span>
            <span className="text-slate-300">{log.message}</span>
            {log.details && (
              <span className="text-slate-500 italic">— {log.details}</span>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center border-t border-slate-800 px-4 py-2">
        <span className="mr-2 text-emerald-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um comando..."
          className="flex-1 bg-transparent text-slate-300 outline-none placeholder:text-slate-600"
          disabled={isProcessing}
        />
      </form>
    </div>
  )
}

const ZEHLA_TERMINAL_VERSION = '0.1.0'
