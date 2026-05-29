import { Result } from '../../../shared/Result'
import { Percentual } from '../../../domain/revenue/value-objects/Percentual'
import { IOcupacaoPort } from '../ports/IOcupacaoPort'

export interface MetricasRevenue {
  adr: number
  revpar: number
  goppar: number
  taxaOcupacaoMedia: number
  receitaTotal: number
  quartosDisponiveis: number
  quartosOcupados: number
  breakEvenRatio: number
  custoOperacionalEstimado: number
}

export class CalcularMetricasRevenueUseCase {
  constructor(
    private readonly ocupacaoPort: IOcupacaoPort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    dataInicio: Date
    dataFim: Date
    custoOperacionalPorQuarto: number
  }): Promise<Result<MetricasRevenue, Error>> {
    const ocupacaoListResult = await this.ocupacaoPort.listarPorPeriodo(
      dados.propriedadeId, dados.dataInicio, dados.dataFim,
    )
    if (ocupacaoListResult.isFail) return Result.fail(ocupacaoListResult.error)
    const ocupacaoList = ocupacaoListResult.value

    if (!ocupacaoList || ocupacaoList.length === 0) {
      return Result.fail(new Error('Nenhum dado de ocupação encontrado para o período'))
    }

    const totalDias = ocupacaoList.length
    const totalQuartosDisponiveis = ocupacaoList.reduce((acc, o) => acc + o.totalQuartosDisponiveis, 0)
    const totalQuartosOcupados = ocupacaoList.reduce((acc, o) => acc + o.totalQuartosOcupados, 0)
    const receitaTotal = ocupacaoList.reduce((acc, o) => acc + o.receitaEstimada.centavos, 0)
    const somaOcupacao = ocupacaoList.reduce((acc, o) => acc + o.taxaOcupacao, 0)

    const taxaOcupacaoMedia = Math.round(somaOcupacao / totalDias)
    const adr = totalQuartosOcupados > 0 ? Math.round(receitaTotal / totalQuartosOcupados) : 0
    const revpar = totalQuartosDisponiveis > 0 ? Math.round(receitaTotal / totalQuartosDisponiveis) : 0
    const custoOperacionalEstimado = totalQuartosOcupados * dados.custoOperacionalPorQuarto
    const goppar = totalQuartosDisponiveis > 0
      ? Math.round((receitaTotal - custoOperacionalEstimado) / totalQuartosDisponiveis)
      : 0
    const breakEvenRatio = receitaTotal > 0
      ? Math.round((custoOperacionalEstimado / receitaTotal) * 100)
      : 0

    return Result.ok({
      adr,
      revpar,
      goppar,
      taxaOcupacaoMedia,
      receitaTotal,
      quartosDisponiveis: totalQuartosDisponiveis,
      quartosOcupados: totalQuartosOcupados,
      breakEvenRatio,
      custoOperacionalEstimado,
    })
  }
}
