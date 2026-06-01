import { Result } from '../../../shared/Result'
import { ITarefaPort } from '../ports/ITarefaPort'
import { ISlaPort } from '../ports/ISlaPort'

export interface MetricasSla {
  total: number
  dentroPrazo: number
  violadas: number
  taxaCumprimento: number
  breakdown: Array<{
    tipo: string
    total: number
    dentroPrazo: number
    taxa: number
  }>
}

export class CalcularMetricasSlaUseCase {
  constructor(
    private readonly tarefaPort: ITarefaPort,
    private readonly slaPort: ISlaPort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    dataInicio: Date
    dataFim: Date
  }): Promise<Result<MetricasSla, Error>> {
    try {
      const tarefasResult = await this.tarefaPort.listarTarefasPorPropriedade(dados.propriedadeId, {
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim,
      })
      if (tarefasResult.isFail) return Result.fail(tarefasResult.error)

      const tarefas = tarefasResult.value || []
      const concluidas = tarefas.filter(t => t.status === 'concluida' && t.dataConclusao)

      const slasAtivos = await this.slaPort.listarAtivos()
      if (slasAtivos.isFail) return Result.fail(slasAtivos.error)

      let dentroPrazo = 0
      let violadas = 0
      const breakdownMap = new Map<string, { total: number; dentroPrazo: number }>()

      for (const tarefa of concluidas) {
        const sla = slasAtivos.value?.find(s => s.tipoTarefa === tarefa.tipo)
        if (!sla || !tarefa.dataConclusao) continue

        const tipo = tarefa.tipo
        if (!breakdownMap.has(tipo)) {
          breakdownMap.set(tipo, { total: 0, dentroPrazo: 0 })
        }
        const entry = breakdownMap.get(tipo)!
        entry.total++

        if (sla.estaDentroDoPrazo(tarefa.dataCriacao, tarefa.dataConclusao)) {
          dentroPrazo++
          entry.dentroPrazo++
        } else {
          violadas++
        }
      }

      const total = concluidas.length
      const taxaCumprimento = total > 0 ? Math.round((dentroPrazo / total) * 100) : 0

      const breakdown = Array.from(breakdownMap.entries()).map(([tipo, data]) => ({
        tipo,
        total: data.total,
        dentroPrazo: data.dentroPrazo,
        taxa: data.total > 0 ? Math.round((data.dentroPrazo / data.total) * 100) : 0,
      }))

      return Result.ok({ total, dentroPrazo, violadas, taxaCumprimento, breakdown })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao calcular métricas de SLA'))
    }
  }
}
