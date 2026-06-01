import { Result } from '../../../shared/Result'
import { Metrica } from '../../../domain/marketing/entities/Metrica'
import { IMetricaPort } from '../../../application/marketing/ports/IMetricaPort'

export class MetricaInMemoryRepository implements IMetricaPort {
  private metricas: Map<string, Metrica> = new Map()

  async registrarMetrica(dados: {
    propriedadeId: string; dataInicio: Date; dataFim: Date
    notaMedia?: number; taxaResposta?: number; sentimentoMedio?: number
    totalReviews?: number; totalRespondidos?: number; totalCampanhas?: number
  }): Promise<Result<Metrica, Error>> {
    const metricaResult = Metrica.create({
      id: `met_${this.metricas.size + 1}_${Date.now()}`,
      propriedadeId: dados.propriedadeId,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
      notaMedia: dados.notaMedia,
      taxaResposta: dados.taxaResposta,
      sentimentoMedio: dados.sentimentoMedio,
      totalReviews: dados.totalReviews,
      totalRespondidos: dados.totalRespondidos,
      totalCampanhas: dados.totalCampanhas,
    })
    if (metricaResult.isFail) return metricaResult
    this.metricas.set(metricaResult.value.id, metricaResult.value)
    return Result.ok(metricaResult.value)
  }

  async buscarMetricaPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Metrica | null, Error>> {
    const encontrada = Array.from(this.metricas.values()).find(
      m => m.propriedadeId === propriedadeId && m.dataInicio.getTime() === dataInicio.getTime() && m.dataFim.getTime() === dataFim.getTime(),
    )
    return Result.ok(encontrada || null)
  }

  async listarHistorico(propriedadeId: string, limite?: number): Promise<Result<Metrica[], Error>> {
    let lista = Array.from(this.metricas.values())
      .filter(m => m.propriedadeId === propriedadeId)
      .sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime())
    if (limite) lista = lista.slice(0, limite)
    return Result.ok(lista)
  }
}
