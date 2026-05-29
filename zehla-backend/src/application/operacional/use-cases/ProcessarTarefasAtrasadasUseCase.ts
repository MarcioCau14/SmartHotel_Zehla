import { Result } from '../../../shared/Result'
import { ITarefaPort } from '../ports/ITarefaPort'
import { Tarefa } from '../../../domain/operacional/entities/Tarefa'

export class ProcessarTarefasAtrasadasUseCase {
  constructor(
    private readonly tarefaPort: ITarefaPort,
  ) {}

  async execute(propriedadeId: string): Promise<Result<Tarefa[], Error>> {
    try {
      const tarefasResult = await this.tarefaPort.listarTarefasAtrasadas(propriedadeId)
      if (tarefasResult.isFail) return Result.fail(tarefasResult.error)

      return Result.ok(tarefasResult.value || [])
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao processar tarefas atrasadas'))
    }
  }
}
