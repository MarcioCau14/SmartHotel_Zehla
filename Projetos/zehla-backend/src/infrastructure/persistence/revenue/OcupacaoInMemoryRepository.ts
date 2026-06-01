import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { Ocupacao } from '../../../domain/revenue/entities/Ocupacao'
import { Percentual } from '../../../domain/revenue/value-objects/Percentual'
import { IOcupacaoPort } from '../../../application/revenue/ports/IOcupacaoPort'

export class OcupacaoInMemoryRepository implements IOcupacaoPort {
  private snapshots: Map<string, Ocupacao> = new Map()

  async registrarSnapshot(dados: {
    propriedadeId: string; data: Date; tipo: string
    totalQuartosDisponiveis: number; totalQuartosOcupados: number
    totalReservasConfirmadas: number; totalReservasPendentes: number
    receitaEstimada: Money
  }): Promise<Result<Ocupacao, Error>> {
    const ocupacaoResult = Ocupacao.create({
      id: `ocup_${this.snapshots.size + 1}_${Date.now()}`,
      ...dados,
    })
    if (ocupacaoResult.isFail) return ocupacaoResult
    this.snapshots.set(ocupacaoResult.value.id, ocupacaoResult.value)
    return Result.ok(ocupacaoResult.value)
  }

  async buscarPorData(propriedadeId: string, data: Date): Promise<Result<Ocupacao | null, Error>> {
    const dataStr = data.toISOString().split('T')[0]
    const encontrado = Array.from(this.snapshots.values()).find(
      o => o.propriedadeId === propriedadeId && o.data.toISOString().split('T')[0] === dataStr,
    )
    return Result.ok(encontrado || null)
  }

  async listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Ocupacao[], Error>> {
    const lista = Array.from(this.snapshots.values()).filter(
      o => o.propriedadeId === propriedadeId && o.data >= dataInicio && o.data <= dataFim,
    )
    return Result.ok(lista)
  }

  async mediaOcupacaoPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Percentual, Error>> {
    const lista = Array.from(this.snapshots.values()).filter(
      o => o.propriedadeId === propriedadeId && o.data >= dataInicio && o.data <= dataFim,
    )
    if (lista.length === 0) return Percentual.criar(0)
    const soma = lista.reduce((acc, o) => acc + o.taxaOcupacao, 0)
    return Percentual.criar(Math.round(soma / lista.length))
  }
}
