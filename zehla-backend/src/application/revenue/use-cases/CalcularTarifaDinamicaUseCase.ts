import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { ITarifaPort } from '../ports/ITarifaPort'
import { IOcupacaoPort } from '../ports/IOcupacaoPort'
import { ISazonalidadePort } from '../ports/ISazonalidadePort'

export interface SugestaoTarifaDinamica {
  regraId: string
  canal: string
  tipoQuarto: string
  valorAtual: number
  valorSugerido: number
  deltaPercentual: number
  justificativa: string
  violaBreakEven: boolean
  violaParidade: boolean
  bloqueadoPorFeriado: boolean
  bloqueadoPorPromocional: boolean
}

export class CalcularTarifaDinamicaUseCase {
  constructor(
    private readonly tarifaPort: ITarifaPort,
    private readonly ocupacaoPort: IOcupacaoPort,
    private readonly sazonalidadePort: ISazonalidadePort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    tipoQuarto: string
    data: Date
  }): Promise<Result<SugestaoTarifaDinamica, Error>> {
    const tarifasResult = await this.tarifaPort.listarPorTipoQuarto(
      dados.propriedadeId, dados.tipoQuarto, dados.data,
    )
    if (tarifasResult.isFail) return Result.fail(tarifasResult.error)

    const tarifas = tarifasResult.value
    if (!tarifas || tarifas.length === 0) {
      return Result.fail(new Error('Nenhuma tarifa ativa encontrada para o tipo de quarto'))
    }

    const tarifa = tarifas[0]

    if (tarifa.tipo === 'promocional') {
      return Result.ok({
        regraId: tarifa.id,
        canal: tarifa.canal,
        tipoQuarto: tarifa.tipoQuarto,
        valorAtual: tarifa.valorDiaria.centavos,
        valorSugerido: tarifa.valorDiaria.centavos,
        deltaPercentual: 0,
        justificativa: 'Tarifa promocional não pode ser alterada pelo Zé-Analyst.',
        violaBreakEven: false,
        violaParidade: false,
        bloqueadoPorFeriado: false,
        bloqueadoPorPromocional: true,
      })
    }

    const sazResult = await this.sazonalidadePort.buscarPorData(dados.propriedadeId, dados.data)
    if (sazResult.isFail) return Result.fail(sazResult.error)

    const sazonalidade = sazResult.value
    if (sazonalidade && sazonalidade.tipo === 'feriado') {
      return Result.ok({
        regraId: tarifa.id,
        canal: tarifa.canal,
        tipoQuarto: tarifa.tipoQuarto,
        valorAtual: tarifa.valorDiaria.centavos,
        valorSugerido: tarifa.valorDiaria.centavos,
        deltaPercentual: 0,
        justificativa: 'Período de feriado requer tarifa promocional e aprovação do Zé-Host.',
        violaBreakEven: false,
        violaParidade: false,
        bloqueadoPorFeriado: true,
        bloqueadoPorPromocional: false,
      })
    }

    const ocupResult = await this.ocupacaoPort.buscarPorData(dados.propriedadeId, dados.data)
    if (ocupResult.isFail) return Result.fail(ocupResult.error)

    const ocupacao = ocupResult.value
    if (!ocupacao) {
      return Result.fail(new Error('Ocupação não encontrada para a data'))
    }

    let multiplicador = 1.0
    let justificativa = ''

    if (ocupacao.taxaOcupacao >= 80) {
      multiplicador = 1.0 + (tarifa.parametrosReajuste.percentualMax / 100)
      justificativa = `Ocupação em ${ocupacao.taxaOcupacao}% (≥80%). Aplicando aumento de até ${tarifa.parametrosReajuste.percentualMax}% por alta demanda.`
    } else if (ocupacao.taxaOcupacao <= 40) {
      const reducaoMax = Math.min(tarifa.parametrosReajuste.percentualMax, 15)
      multiplicador = 1.0 - (reducaoMax / 100)
      justificativa = `Ocupação em ${ocupacao.taxaOcupacao}% (≤40%). Aplicando redução controlada de ${reducaoMax}% para estimular demanda.`
    } else {
      if (sazonalidade) {
        multiplicador = sazonalidade.multiplicadorPreco
        justificativa = `Ocupação normal (${ocupacao.taxaOcupacao}%). Aplicando multiplicador sazonal de ${sazonalidade.multiplicadorPreco}x (${sazonalidade.tipo}).`
      } else {
        justificativa = `Ocupação estável em ${ocupacao.taxaOcupacao}%. Nenhum ajuste necessário.`
      }
    }

    const valorSugeridoCentavos = Math.round(tarifa.valorDiaria.centavos * multiplicador)
    const valorSugeridoResult = Money.criar(valorSugeridoCentavos)
    if (valorSugeridoResult.isFail) return Result.fail(valorSugeridoResult.error)
    const valorSugerido = valorSugeridoResult.value

    const delta = Math.abs(valorSugerido.centavos - tarifa.valorDiaria.centavos) / tarifa.valorDiaria.centavos
    const violaBreakEven = !tarifa.breakEvenPoint.estaCobertoPor(valorSugerido)

    if (violaBreakEven) {
      return Result.ok({
        regraId: tarifa.id,
        canal: tarifa.canal,
        tipoQuarto: tarifa.tipoQuarto,
        valorAtual: tarifa.valorDiaria.centavos,
        valorSugerido: tarifa.valorDiaria.centavos,
        deltaPercentual: 0,
        justificativa: `Valor sugerido (${valorSugerido.centavos}) viola break-even point (${tarifa.breakEvenPoint.valor.centavos}). Reajuste bloqueado.`,
        violaBreakEven: true,
        violaParidade: false,
        bloqueadoPorFeriado: false,
        bloqueadoPorPromocional: false,
      })
    }

    const deltaPercentual = Math.round(delta * 100)

    return Result.ok({
      regraId: tarifa.id,
      canal: tarifa.canal,
      tipoQuarto: tarifa.tipoQuarto,
      valorAtual: tarifa.valorDiaria.centavos,
      valorSugerido: valorSugerido.centavos,
      deltaPercentual,
      justificativa,
      violaBreakEven: false,
      violaParidade: false,
      bloqueadoPorFeriado: false,
      bloqueadoPorPromocional: false,
    })
  }
}
