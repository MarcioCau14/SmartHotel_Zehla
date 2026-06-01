import { useState, useCallback } from 'react'
import { Result } from '../shared/Result'
import { HospitalityServiceAdapter } from '../services/adapters/HospitalityServiceAdapter'

export interface CognitiveEvent {
  eventId: string
  timestamp: Date
  intent: string
  origem: string
  needsEscalation: boolean
  handoffRequired: boolean
  responseText: string
}

export function useZehlaBrain() {
  const [events, setEvents] = useState<CognitiveEvent[]>([])
  const [isThinking, setIsThinking] = useState(false)

  const triggerManualIntent = useCallback(
    async (intent: string, payload?: any): Promise<Result<void, Error>> => {
      setIsThinking(true)
      const adapter = new HospitalityServiceAdapter()
      const result = await adapter.processarIntencao(intent, payload)
      setIsThinking(false)

      if (result.isFail) {
        return Result.fail(result.error)
      }

      const response = result.value
      const newEvent: CognitiveEvent = {
        eventId: response.responseId || `event-${Date.now()}`,
        timestamp: new Date(),
        intent,
        origem: 'ze-concierge',
        needsEscalation: response.needsEscalation || false,
        handoffRequired: response.handoffRequired || false,
        responseText: response.responseText,
      }

      setEvents((prev) => [newEvent, ...prev])
      return Result.ok(undefined)
    },
    []
  )

  const escalateToHuman = useCallback(async (eventId: string): Promise<Result<void, Error>> => {
    try {
      setEvents((prev) =>
        prev.map((evt) =>
          evt.eventId === eventId
            ? { ...evt, needsEscalation: false, responseText: '[Human Hijacked] Operador Humano assumiu o atendimento.' }
            : evt
        )
      )
      return Result.ok(undefined)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Escalation failed'))
    }
  }, [])

  return {
    events,
    isThinking,
    triggerManualIntent,
    escalateToHuman,
  }
}
