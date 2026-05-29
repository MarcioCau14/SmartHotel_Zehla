import { useState, useCallback, useEffect } from 'react'
import { Result } from '../shared/Result'
import { OperationsServiceAdapter } from '../services/adapters/OperationsServiceAdapter'

export interface TaskItem {
  id: string
  quartoId: string
  tipo: 'limpeza' | 'manutencao'
  status: 'pendente' | 'em_progresso' | 'concluido'
  titulo: string
}

export function useOperationsTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    const adapter = new OperationsServiceAdapter()
    const result = await adapter.listarTarefas()
    setLoading(false)

    if (result.isFail) {
      setError(result.error.message)
      // Fallback a tarefas de demonstração na UI se o banco local estiver vazio
      setTasks([
        { id: 'task-1', quartoId: '101', tipo: 'limpeza', status: 'pendente', titulo: 'Higienização de Saída - Quarto 101' },
        { id: 'task-2', quartoId: '204', tipo: 'manutencao', status: 'em_progresso', titulo: 'Ajuste de Ar Condicionado' },
        { id: 'task-3', quartoId: '105', tipo: 'limpeza', status: 'concluido', titulo: 'Preparação Inicial' },
      ])
      return
    }

    const fetchedTasks = (result.value.data?.tasks || []) as TaskItem[]
    setTasks(fetchedTasks)
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const criarTarefa = useCallback(
    async (payload: { quartoId: string; tipo: 'limpeza' | 'manutencao'; titulo?: string }): Promise<Result<void, Error>> => {
      const adapter = new OperationsServiceAdapter()
      const result = await adapter.criarTarefa(payload.quartoId, payload.tipo, payload.titulo)
      if (result.isFail) {
        return Result.fail(result.error)
      }

      const createdId = result.value.data?.tarefaId || `t-${Date.now()}`
      const newTask: TaskItem = {
        id: createdId,
        quartoId: payload.quartoId,
        tipo: payload.tipo,
        status: 'pendente',
        titulo: payload.titulo || `Realizar ${payload.tipo} no quarto ${payload.quartoId}`,
      }

      setTasks((prev) => [newTask, ...prev])
      return Result.ok(undefined)
    },
    []
  )

  const atualizarStatusTarefa = useCallback(
    async (id: string, status: 'pendente' | 'em_progresso' | 'concluido'): Promise<Result<void, Error>> => {
      // Otimisticamente atualiza na UI
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      )

      const adapter = new OperationsServiceAdapter()
      const result = await adapter.atualizarStatus(id, status)
      if (result.isFail) {
        // Se falhar no backend, reverte opcionalmente ou re-fetch
        fetchTasks()
        return Result.fail(result.error)
      }

      return Result.ok(undefined)
    },
    [fetchTasks]
  )

  return {
    tasks,
    loading,
    error,
    criarTarefa,
    atualizarStatusTarefa,
    refresh: fetchTasks,
  }
}
