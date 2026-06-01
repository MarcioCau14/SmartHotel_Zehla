'use client'

import { useLeadsKanban } from '../../../hooks/useLeadsKanban'
import { useZehlaBrain } from '../../../hooks/useZehlaBrain'
import { LeadKanbanUI, montarColunas } from '../../../components/zcc/LeadKanbanUI'
import { CognitiveTerminalUI } from '../../../components/zcc/CognitiveTerminalUI'
import type { CognitiveTerminalUIProps } from '../../../components/zcc/CognitiveTerminalUI'
import type { KanbanCardProps } from '../../../components/ui/KanbanCard'

function eventosParaBubbles(
  events: { eventId: string; intent: string; origem: string; needsEscalation: boolean; responseText: string; timestamp: Date; confidenceScore: number }[],
): CognitiveTerminalUIProps['events'] {
  return events.map((evt) => ({
    messageId: evt.eventId,
    text: evt.responseText,
    timestamp: evt.timestamp,
    intent: evt.intent,
    origem: evt.origem,
    needsEscalation: evt.needsEscalation,
    confidenceScore: evt.confidenceScore,
  }))
}

export default function ZCCLeadsPage() {
  const {
    leads,
    isLoading,
    error,
    qualificarLead,
    realizarHandoff,
    calcularEscada,
  } = useLeadsKanban()

  const {
    events,
    isThinking,
    sendMessage,
    escalateToHuman,
  } = useZehlaBrain()

  const colunas = montarColunas(leads as unknown as Record<string, KanbanCardProps[]>)

  const handleHandoff = (leadId: string) => {
    realizarHandoff(leadId, 'current-user', {
      score: 70,
      icpFit: 'ideal',
      objecoes: [],
      respostas: [],
      gatilho: 'manual',
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-500">Zehla Control Center</h1>
          <p className="text-sm text-slate-400">Gestão de Leads Comerciais</p>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-slate-300 mb-4">📊 Kanban de Leads</h2>
        <LeadKanbanUI
          colunas={colunas}
          isLoading={isLoading}
          error={error}
          onQualificar={(id) => qualificarLead(id)}
          onHandoff={handleHandoff}
          onVerEscada={(id) => calcularEscada(id, 'front_end')}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-300 mb-4">🧠 Terminal Cognitivo</h2>
        <CognitiveTerminalUI
          events={eventosParaBubbles(events)}
          isThinking={isThinking}
          onSendMessage={(text) => sendMessage(text)}
          onEscalateToHuman={(eventId) => escalateToHuman(eventId)}
        />
      </section>
    </div>
  )
}
