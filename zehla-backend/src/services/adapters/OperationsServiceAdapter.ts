import { BaseHttpAdapter } from './BaseHttpAdapter'
import { Result } from '../../shared/Result'

export interface TaskResponse {
  responseId: string
  success: boolean
  responseText: string
  confidenceScore: number
  needsEscalation: boolean
  handoffRequired: boolean
  data?: any
}

export class OperationsServiceAdapter extends BaseHttpAdapter {
  async processarIntencao(intent: string, payload?: any): Promise<Result<TaskResponse, Error>> {
    return this.post<TaskResponse>('/api/operacional/tarefas', {
      intent,
      payload: payload || {},
    })
  }

  async criarTarefa(quartoId: string, tipo: 'limpeza' | 'manutencao', titulo?: string): Promise<Result<TaskResponse, Error>> {
    return this.processarIntencao('CRIAR_TAREFA', {
      quartoId,
      tipo,
      titulo: titulo || `Realizar ${tipo} no quarto ${quartoId}`,
    })
  }

  async listarTarefas(filtros?: { status?: string[]; tipo?: string }): Promise<Result<TaskResponse, Error>> {
    return this.processarIntencao('LISTAR_TAREFAS', filtros)
  }

  async atualizarStatus(id: string, status: 'pendente' | 'em_progresso' | 'concluido'): Promise<Result<TaskResponse, Error>> {
    return this.processarIntencao('ATUALIZAR_STATUS', { id, status })
  }
}
