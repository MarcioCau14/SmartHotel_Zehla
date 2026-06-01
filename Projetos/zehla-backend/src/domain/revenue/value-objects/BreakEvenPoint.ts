import { Result } from '../../../shared/Result'
import { Money } from '../../comercial/value-objects/Money'
import { Percentual } from './Percentual'

export type TipoCustoBreakEven = 'operacional' | 'total'

export class BreakEvenPoint {
  private constructor(
    public readonly valor: Money,
    public readonly tipoCusto: TipoCustoBreakEven,
  ) {
    Object.freeze(this)
  }

  static criar(valor: Money, tipoCusto: string): Result<BreakEvenPoint, Error> {
    if (!['operacional', 'total'].includes(tipoCusto)) {
      return Result.fail(new Error('Tipo de custo deve ser operacional ou total'))
    }
    if (valor.isZero()) {
      return Result.fail(new Error('Break-even point não pode ser zero'))
    }
    return Result.ok(new BreakEvenPoint(valor, tipoCusto as TipoCustoBreakEven))
  }

  estaCobertoPor(valorDiaria: Money): boolean {
    return valorDiaria.centavos >= this.valor.centavos
  }

  margemSobre(valorDiaria: Money): Result<Percentual, Error> {
    if (this.valor.centavos > valorDiaria.centavos) {
      return Result.fail(new Error('Valor da diária está abaixo do break-even'))
    }
    const diferenca = valorDiaria.centavos - this.valor.centavos
    const percentual = Math.round((diferenca / this.valor.centavos) * 100)
    return Percentual.criar(percentual)
  }

  equals(other: BreakEvenPoint): boolean {
    return this.valor.equals(other.valor) && this.tipoCusto === other.tipoCusto
  }
}
