'use client'

import { useState } from 'react'
import { ChatBubble, type ChatBubbleProps } from '../ui/ChatBubble'

export interface CognitiveTerminalUIProps {
  events: Omit<ChatBubbleProps, 'onEscalate'>[]
  isThinking: boolean
  onSendMessage: (text: string) => void
  onEscalateToHuman: (eventId: string) => void
}

export function CognitiveTerminalUI({
  events,
  isThinking,
  onSendMessage,
  onEscalateToHuman,
}: CognitiveTerminalUIProps) {
  const [inputText, setInputText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputText.trim()
    if (!text) return
    onSendMessage(text)
    setInputText('')
  }

  return (
    <div className="flex flex-col h-[600px] w-full rounded-lg border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden font-mono text-sm text-slate-50">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-bold text-orange-500 tracking-wider">ZEHLA COGNITIVE RADAR v4.0</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Swarm Node: active</span>
          {isThinking && <span className="text-orange-500 animate-bounce">Thinking...</span>}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/70 backdrop-blur-md">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center space-y-2">
            <span className="text-xl">⚡</span>
            <span>Aguardando tráfego cognitivo neural...</span>
            <span className="text-xs text-slate-600">
              Digite uma mensagem abaixo para iniciar.
            </span>
          </div>
        ) : (
          events.map((evt) => (
            <ChatBubble
              key={evt.messageId}
              {...evt}
              onEscalate={() => onEscalateToHuman(evt.messageId)}
            />
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite uma mensagem para os agentes..."
          disabled={isThinking}
          className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isThinking || !inputText.trim()}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded transition-colors disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
