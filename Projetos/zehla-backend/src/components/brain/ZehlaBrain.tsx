'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  tools_called?: string[]
  tokens_used?: number
}

interface SessionOption {
  session_id: string
  pousada_id?: string
  created_at: string
  message_count: number
  last_activity: string
}

interface BrainState {
  isConnected: boolean
  isLoading: boolean
  sessionId: string | null
  messages: Message[]
  sessions: SessionOption[]
}

export default function ZehlaBrain({ pousadaId }: { pousadaId?: string }) {
  const [state, setState] = useState<BrainState>({
    isConnected: false,
    isLoading: false,
    sessionId: null,
    messages: [],
    sessions: [],
  })
  const [input, setInput] = useState('')
  const [suggestions] = useState([
    'Qual a taxa de ocupação prevista para a próxima semana?',
    'Sugira preços para o feriado de Corpus Christi',
    'Crie uma resposta para um hóspede perguntando sobre café da manhã',
    'Gere um post de Instagram sobre a experiência na pousada',
    'Analise os concorrentes na minha região',
    'Gere o relatório operacional de hoje',
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [state.messages])

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/brain/health')
        const data = await res.json()
        setState(prev => ({ ...prev, isConnected: data?.success ?? data?.data?.openrouter ?? false }))
      } catch {
        setState(prev => ({ ...prev, isConnected: false }))
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/brain/health')
        if (res.ok) {
          const data = await res.json()
          if (data?.sessions) {
            setState(prev => ({ ...prev, sessions: data.sessions }))
          }
        }
      } catch {
        // Sessions are optional
      }
    }
    if (state.isConnected) {
      fetchSessions()
    }
  }, [state.isConnected])

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || state.isLoading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      messages: [...prev.messages, userMsg],
    }))
    setInput('')

    try {
      const res = await fetch('/api/brain/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session_id: state.sessionId,
          pousada_id: pousadaId,
        }),
      })

      const data = await res.json()

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || 'Sem resposta do Brain.',
        timestamp: data.timestamp || new Date().toISOString(),
        tools_called: data.tools_called,
        tokens_used: data.tokens_used,
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        sessionId: data.session_id || prev.sessionId,
        messages: [...prev.messages, assistantMsg],
      }))
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        messages: [
          ...prev.messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Erro ao conectar com o ZEHLA Brain. Verifique se o servidor HERMES está rodando.',
            timestamp: new Date().toISOString(),
          },
        ],
      }))
    }
  }, [state.isLoading, state.sessionId, pousadaId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const newSession = () => {
    setState(prev => ({ ...prev, sessionId: null, messages: [] }))
  }

  const changeSession = (sessionId: string) => {
    setState(prev => ({ ...prev, sessionId }))
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 to-slate-900 text-white rounded-xl overflow-hidden border border-slate-800">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${state.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              ZEHLA Brain
              {state.isConnected && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                  ONLINE
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">
              {state.isConnected
                ? `Sessão: ${state.sessionId ? state.sessionId.slice(0, 8) + '...' : 'Nova'}`
                : 'Servidor offline — configure o HERMES Engine'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state.sessions.length > 0 && (
            <select
              value={state.sessionId || ''}
              onChange={(e) => changeSession(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300"
            >
              <option value="">Nova sessão</option>
              {state.sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.session_id.slice(0, 8)}... ({s.message_count} msgs)
                </option>
              ))}
            </select>
          )}
          {state.messages.length > 0 && (
            <button
              onClick={newSession}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Nova sessão
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-6xl mb-4 font-light opacity-60">Z</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Cérebro ZEHLA — Powered by HERMES Agent
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              Seu assistente cognitivo inteligente para gestão de pousadas.
              Revenue management, atendimento, marketing e muito mais.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700'
              }`}
            >
              <div className="text-sm leading-relaxed">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      code: ({ children }) => (
                        <code className="bg-slate-900 rounded px-1 py-0.5 text-xs font-mono text-emerald-300">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-slate-900 rounded-lg p-3 mb-2 overflow-x-auto text-xs">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-500">
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'assistant' && msg.tools_called && msg.tools_called.length > 0 && (
                  <div className="flex gap-1">
                    {msg.tools_called.map((tool, i) => (
                      <span key={i} className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-mono">
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
                {msg.tokens_used && (
                  <span className="text-[10px] text-slate-600">{msg.tokens_used} tokens</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {state.isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-slate-400">ZEHLA Brain pensando...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={state.isConnected ? 'Pergunte ao ZEHLA Brain...' : 'Configure o HERMES Engine primeiro...'}
            disabled={state.isLoading}
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={state.isLoading || !input.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {state.isLoading ? '...' : 'Enviar'}
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          HERMES Agent | 8 ferramentas ZEHLA ativas
        </p>
      </div>
    </div>
  )
}
