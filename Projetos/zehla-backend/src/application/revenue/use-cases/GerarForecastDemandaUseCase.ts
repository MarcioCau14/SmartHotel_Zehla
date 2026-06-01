import { Result } from '../../../shared/Result'
import { Forecast } from '../../../domain/revenue/entities/Forecast'
import { IOcupacaoPort } from '../ports/IOcupacaoPort'
import { ISazonalidadePort } from '../ports/ISazonalidadePort'
import { IForecastPort } from '../ports/IForecastPort'

export class GerarForecastDemandaUseCase {
  constructor(
    private readonly ocupacaoPort: IOcupacaoPort,
    private readonly sazonalidadePort: ISazonalidadePort,
    private readonly forecastPort: IForecastPort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    horizonte: 7 | 30 | 90
  }): Promise<Result<Forecast, Error>> {
    const hoje = new Date()
    const diasHistorico = dados.horizonte === 90 ? 365 : 90
    const historicoInicio = new Date(hoje.getTime() - diasHistorico * 86400000)

    const ocupacaoHistoricoResult = await this.ocupacaoPort.listarPorPeriodo(
      dados.propriedadeId, historicoInicio, hoje,
    )
    if (ocupacaoHistoricoResult.isFail) return Result.fail(ocupacaoHistoricoResult.error)
    const ocupacaoHistorico = ocupacaoHistoricoResult.value

    const mediaOcupacao = ocupacaoHistorico.length > 0
      ? ocupacaoHistorico.reduce((acc, o) => acc + o.taxaOcupacao, 0) / ocupacaoHistorico.length
      : 50

    const mediaReceita = ocupacaoHistorico.length > 0
      ? ocupacaoHistorico.reduce((acc, o) => acc + o.receitaEstimada.centavos, 0) / ocupacaoHistorico.length
      : 50000

    const previsaoOcupacao: number[] = []
    const previsaoReceita: number[] = []
    const previsaoADR: number[] = []
    const previsaoRevPAR: number[] = []

    for (let dia = 0; dia < dados.horizonte; dia++) {
      const dataDia = new Date(hoje.getTime() + (dia + 1) * 86400000)
      const sazResult = await this.sazonalidadePort.buscarPorData(dados.propriedadeId, dataDia)
      const multiplicador = (sazResult.isOk && sazResult.value) ? sazResult.value.multiplicadorPreco : 1.0

      const variacao = (Math.random() - 0.5) * 10
      let ocupacaoDia = Math.round(mediaOcupacao * multiplicador + variacao)
      ocupacaoDia = Math.max(0, Math.min(100, ocupacaoDia))

      const receitaBase = Math.round(mediaReceita * multiplicador * (ocupacaoDia / 100))
      const adr = ocupacaoDia > 0 ? Math.round(receitaBase / Math.max(1, ocupacaoDia)) : 0
      const revpar = Math.round(receitaBase / 100)

      previsaoOcupacao.push(ocupacaoDia)
      previsaoReceita.push(receitaBase)
      previsaoADR.push(adr)
      previsaoRevPAR.push(revpar)
    }

    const limiteConfianca: Record<number, number> = { 7: 0.95, 30: 0.85, 90: 0.70 }
    const confiancaMedia = limiteConfianca[dados.horizonte] - (Math.random() * 0.05)
    const variancia = ocupacaoHistorico.length > 0
      ? Math.sqrt(ocupacaoHistorico.reduce((acc, o) => acc + Math.pow(o.taxaOcupacao - mediaOcupacao, 2), 0) / Math.max(1, ocupacaoHistorico.length))
      : 5

    const result = await this.forecastPort.salvarForecast({
      propriedadeId: dados.propriedadeId,
      horizonte: dados.horizonte,
      previsaoOcupacao,
      previsaoReceita,
      previsaoADR,
      previsaoRevPAR,
      confiancaMedia: Math.round(confiancaMedia * 100) / 100,
      variancia: Math.round(variancia * 100) / 100,
      dadosHistoricoInicio: historicoInicio,
      dadosHistoricoFim: hoje,
      assinaturaModelo: `ze-analyst-v1-${dados.horizonte}d-${Date.now()}`,
    })

    return result
  }
}
