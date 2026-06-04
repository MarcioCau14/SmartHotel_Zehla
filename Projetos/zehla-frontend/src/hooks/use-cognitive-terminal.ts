import { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api/api-client'
import { API } from '@/lib/api/api-routes'
import type { LogEntry } from '@/types/brain'

const BRAIN_LOGS_KEY = ['brain', 'logs'] as const

function freezeLogEntry(entry: LogEntry): LogEntry {
  return Object.freeze({
    ...entry,
    details: entry.details ? Object.freeze(entry.details) : undefined,
  })
}

export function useCognitiveTerminal() {
  const [commandHistory, setCommandHistory] = useState<ReadonlyArray<string>>(Object.freeze([]))

  const logsQuery = useQuery({
    queryKey: BRAIN_LOGS_KEY,
    queryFn: async () => {
      const result = await apiGet<LogEntry[]>(API.BRAIN.METRICS)
      if (result.isFail) throw result.error
      return Object.freeze(result.getOrThrow().map(freezeLogEntry))
    },
    refetchInterval: 10_000,
    staleTime: 5_000,
  })

  const commandMutation = useMutation({
    mutationFn: async (command: string) => {
      const result = await apiPost<{ reply: string }>(API.BRAIN.METRICS, { command })
      if (result.isFail) throw result.error
      setCommandHistory((prev) => Object.freeze([...prev, command]))
      return result.getOrThrow()
    },
  })

  const submitCommand = useCallback(
    (command: string) => {
      commandMutation.mutate(command)
    },
    [commandMutation],
  )

  const logs: ReadonlyArray<LogEntry> = logsQuery.data ?? Object.freeze([])

  return {
    logs,
    isProcessing: commandMutation.isPending,
    error: logsQuery.error?.message ?? commandMutation.error?.message ?? null,
    submitCommand,
    commandHistory,
    refresh: logsQuery.refetch,
  }
}
