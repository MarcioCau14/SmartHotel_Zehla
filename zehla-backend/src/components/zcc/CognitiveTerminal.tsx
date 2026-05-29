'use client'

import React, { useState } from 'react'
import { useZehlaBrain } from '../../hooks/useZehlaBrain'

export function CognitiveTerminal() {
  const { events, isThinking, triggerManualIntent, escalateToHuman } = useZehlaBrain()
  const [inputText, setInputText] = useState('')
  const [selectedIntent, setSelectedIntent] = useState('CONSULTAR_SERVICOS')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    await triggerManualIntent(selectedIntent, { prompt: inputText })
    setInputText('')
  }

  return (
    <div className="flex flex-col h-[600px] w-full rounded-lg border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden font-mono text-sm text-slate-50">
      {/* Terminal Header */}
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

      {/* Terminal Display Logs */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/70 backdrop-blur-md">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center space-y-2">
            <span className="text-xl">⚡</span>
            <span>Aguardando tráfego cognitivo neural...</span>
            <span className="text-xs text-slate-600">Dispare uma intenção de hospitalidade abaixo para iniciar.</span>
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.eventId}
              className={`p-3 rounded border transition-all duration-300 ${
                evt.needsEscalation
                  ? 'border-red-500 bg-red-950/20 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 border border-slate-700">
                  {evt.intent}
                </span>
                <span>{evt.timestamp.toLocaleTimeString()}</span>
              </div>
              
              <p className="text-slate-200 leading-relaxed mb-2">{evt.responseText}</p>
              
              {evt.needsEscalation && (
                <div className="flex items-center justify-between mt-3 p-2 bg-red-950/40 rounded border border-red-900/60">
                  <span className="text-xs text-red-400 font-bold">⚠️ Handoff solicitado: Intervenção Humana Necessária</span>
                  <button
                    onClick={() => escalateToHuman(evt.eventId)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded transition-colors"
                  >
                    Assumir Conversa
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Terminal Input Controls */}
      <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
        <select
          value={selectedIntent}
          onChange={(e) => setSelectedIntent(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-300 outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="CONSULTAR_SERVICOS">Consultar Serviços</option>
          <option value="CRIAR_RESERVA">Criar Reserva</option>
          <option value="QUALIFICAR_LEAD">Qualificar Lead</option>
        </select>
        
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escreva uma instrução para os agentes..."
          className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />

        <button
          type="submit"
          disabled={isThinking}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded transition-colors disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
