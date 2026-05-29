import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { ITarifaPort } from '../ports/ITarifaPort'
import { ElasticidadePreco } from '../../../domain/revenue/value-objects/ElasticidadePreco'

export interface AjusteCanal {
  canal: string
  tipoQuarto: string
  valorAtual: number
  valorSugerido: number
  deltaPercentual: number
  justificativa: string
}

export class RebalancearTarifasPorCanalUseCase {
  constructor(
    private readonly tarifaPort: ITarifaPort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    data: Date
    elasticidadePorCanal: Record<string, number>
  }): Promise<Result<AjusteCanal[], Error>> {
    const tarifasResult = await this.tarifaPort.listarAtivas(dados.propriedadeId, dados.data)
    if (tarifasResult.isFail) return Result.fail(tarifasResult.error)

    const tarifas = tarifasResult.value
    if (!tarifas || tarifas.length === 0) {
      return Result.fail(new Error('Nenhuma tarifa ativa encontrada'))
    }

    const ajustes: AjusteCanal[] = []

    for (const tarifa of tarifas) {
      if (tarifa.tipo === 'promocional') continue

      const elasticidadeValor = dados.elasticidadePorCanal[tarifa.canal] ?? -1.0
      const elasticidadeResult = ElasticidadePreco.criar(elasticidadeValor)
      if (elasticidadeResult.isFail) continue
      const elasticidade = elasticidadeResult.value

      let multiplicador = 1.0
      let justificativa = ''

      if (elasticidade.valor > -0.5) {
        multiplicador = 1.10
        justificativa = `Canal ${tarifa.canal} com demanda inelástica (elasticidade=${elasticidade.valor}). Sugerindo aumento de 10%.`
      } else if (elasticidade.valor < -1.0) {
        multiplicador = 0.95
        justificativa = `Canal ${tarifa.canal} com demanda elástica (elasticidade=${elasticidade.valor}). Sugerindo redução de 5% para ganhar volume.`
      } else {
        multiplicador = 1.0
        justificativa = `Canal ${tarifa.canal} com elasticidade neutra (${elasticidade.valor}). Mantendo tarifa atual.`
      }

      const valorSugeridoCentavos = Math.round(tarifa.valorDiaria.centavos * multiplicador)
      const valorSugeridoResult = Money.criar(valorSugeridoCentavos)
      if (valorSugeridoResult.isFail) continue
      const valorSugerido = valorSugeridoResult.value

      if (!tarifa.breakEvenPoint.estaCobertoPor(valorSugerido)) {
        justificativa = `Canal ${tarifa.canal}: redução bloquada — valor viola break-even point.`
        ajustes.push({
          canal: tarifa.canal,
          tipoQuarto: tarifa.tipoQuarto,
          valorAtual: tarifa.valorDiaria.centavos,
          valorSugerido: tarifa.valorDiaria.centavos,
          deltaPercentual: 0,
          justificativa,
        })
        continue
      }

      const delta = Math.round(Math.abs(valorSugerido.centavos - tarifa.valorDiaria.centavos) / tarifa.valorDiaria.centavos * 100)
      if (delta > 20) {
        justificativa = `Canal ${tarifa.canal}: delta de ${delta}% excede limite de 20%. Ajuste não aplicado.`
        ajustes.push({
          canal: tarifa.canal,
          tipoQuarto: tarifa.tipoQuarto,
          valorAtual: tarifa.valorDiaria.centavos,
          valorSugerido: tarifa.valorDiaria.centavos,
          deltaPercentual: 0,
          justificativa,
        })
        continue
      }

      ajustes.push({
        canal: tarifa.canal,
        tipoQuarto: tarifa.tipoQuarto,
        valorAtual: tarifa.valorDiaria.centavos,
        valorSugerido: valorSugerido.centavos,
        deltaPercentual: delta,
        justificativa,
      })
    }

    return Result.ok(ajustes)
  }
}
