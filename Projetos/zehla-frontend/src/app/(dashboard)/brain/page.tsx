'use client'

import { useCognitiveTerminal } from '@/hooks/use-cognitive-terminal'
import { CognitiveTerminal } from '@/components/features/brain/CognitiveTerminal'
import { ErrorMessage } from '@/components/ui/error-message'

export default function BrainsPage() {
  const { logs, isProcessing, error, submitCommand, refresh } = useCognitiveTerminal()

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Cognitive Terminal</h1>
        <ErrorMessage message={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cognitive Terminal</h1>
      <p className="text-sm text-muted-foreground">
        Observabilidade e controle dos agentes ZAOS em tempo real.
      </p>
      <CognitiveTerminal
        logs={logs}
        isProcessing={isProcessing}
        onCommandSubmit={submitCommand}
      />
    </div>
  )
}
