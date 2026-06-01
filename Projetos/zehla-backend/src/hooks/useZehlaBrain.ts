import { useState, useCallback } from 'react'
import { Result } from '../shared/Result'
import { apiPost, apiGet } from './apiClient'

export interface CognitiveEvent {
  eventId: string
  timestamp: Date
  intent: string
  origem: string
  needsEscalation: boolean
  handoffRequired: boolean
  responseText: string
  confidenceScore: number
}

interface ChatResponse {
  success: boolean
  data: {
    eventId: string
    intent: string
    origem: string
    needsEscalation: boolean
    handoffRequired: boolean
    responseText: string
    confidenceScore: number
  }
}

interface HealthResponse {
  success: boolean
  data: {
    status: string
    uptime: number
  }
}

export function useZehlaBrain() {
  const [events, setEvents] = useState<CognitiveEvent[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (text: string): Promise<Result<CognitiveEvent, Error>> => {
    setIsThinking(true)
    setError(null)

    const result = await apiPost<ChatResponse>('/api/brain/chat', { message: text })
    setIsThinking(false)

    if (result.isFail) {
      setError(result.error.message)
      return Result.fail(result.error)
    }

    const { data } = result.value
    const event: CognitiveEvent = {
      eventId: data.eventId,
      timestamp: new Date(),
      intent: data.intent,
      origem: data.origem,
      needsEscalation: data.needsEscalation,
      handoffRequired: data.handoffRequired,
      responseText: data.responseText,
      confidenceScore: data.confidenceScore,
    }

    setEvents((prev) => [event, ...prev])
    return Result.ok(event)
  }, [])

  const triggerManualIntent = useCallback(async (
    intent: string,
    payload?: Record<string, unknown>,
  ): Promise<Result<void, Error>> => {
    setIsThinking(true)
    setError(null)

    const result = await apiPost<ChatResponse>('/api/brain/chat', { intent, payload })
    setIsThinking(false)

    if (result.isFail) {
      setError(result.error.message)
      return Result.fail(result.error)
    }

    const { data } = result.value
    const event: CognitiveEvent = {
      eventId: data.eventId,
      timestamp: new Date(),
      intent: data.intent,
      origem: data.origem,
      needsEscalation: data.needsEscalation,
      handoffRequired: data.handoffRequired,
      responseText: data.responseText,
      confidenceScore: data.confidenceScore,
    }

    setEvents((prev) => [event, ...prev])
    return Result.ok(undefined)
  }, [])

  const escalateToHuman = useCallback(async (eventId: string): Promise<Result<void, Error>> => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.eventId === eventId
          ? { ...evt, needsEscalation: false, responseText: '[Human Hijacked] Operador Humano assumiu o atendimento.' }
          : evt,
      ),
    )
    return Result.ok(undefined)
  }, [])

  return {
    events,
    isThinking,
    error,
    sendMessage,
    triggerManualIntent,
    escalateToHuman,
  }
}
