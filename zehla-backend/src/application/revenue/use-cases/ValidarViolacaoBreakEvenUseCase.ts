import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { ITarifaPort } from '../ports/ITarifaPort'

export interface ResultadoValidacaoBreakEven {
  valido: boolean
  valorDiaria: number
  breakEven: number
  margemPercentual: number
  breakEvenAtingido: boolean
}

export class ValidarViolacaoBreakEvenUseCase {
  constructor(
    private readonly tarifaPort: ITarifaPort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    regraTarifariaId: string
    valorPretendido: Money
  }): Promise<Result<ResultadoValidacaoBreakEven, Error>> {
    const regraResult = await this.tarifaPort.buscarPorId(dados.regraTarifariaId, dados.propriedadeId)
    if (regraResult.isFail) return Result.fail(regraResult.error)
    if (!regraResult.value) {
      return Result.fail(new Error('TARIFA_NOT_FOUND'))
    }

    const regra = regraResult.value
    const breakEven = regra.breakEvenPoint

    if (!breakEven.estaCobertoPor(dados.valorPretendido)) {
      return Result.ok({
        valido: false,
        valorDiaria: dados.valorPretendido.centavos,
        breakEven: breakEven.valor.centavos,
        margemPercentual: 0,
        breakEvenAtingido: true,
      })
    }

    const margemResult = breakEven.margemSobre(dados.valorPretendido)
    const margemPercentual = margemResult.isOk ? margemResult.value.valor : 0
    const breakEvenAtingido = margemPercentual <= 10

    return Result.ok({
      valido: true,
      valorDiaria: dados.valorPretendido.centavos,
      breakEven: breakEven.valor.centavos,
      margemPercentual,
      breakEvenAtingido,
    })
  }
}
