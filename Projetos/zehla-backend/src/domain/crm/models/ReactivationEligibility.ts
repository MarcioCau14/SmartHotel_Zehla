import { Result } from '../../../shared/Result'
import { ConsentimentoLGPD } from './MarketIntelligence'

export const REACTIVATION_THRESHOLD_DAYS = 180

export function lgpdPermiteReativacao(consentimento: ConsentimentoLGPD): boolean {
  return consentimento === 'consentimento' || consentimento === 'legitimo_interesse'
}

export class ReactivationEligibility {
  private constructor(
    public readonly isEligible: boolean,
    public readonly daysSinceCheckout: number,
    public readonly checkoutDate: Date,
    public readonly consentimentoLGPD: ConsentimentoLGPD,
    public readonly motivoInelegivel: string | null,
  ) {
    Object.freeze(this)
  }

  static evaluate(
    checkoutDate: Date,
    currentDate: Date,
    consentimentoLGPD: ConsentimentoLGPD = 'consentimento',
  ): Result<ReactivationEligibility, Error> {
    if (!(checkoutDate instanceof Date) || isNaN(checkoutDate.getTime())) {
      return Result.fail(new Error('checkoutDate deve ser uma data válida'))
    }
    if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) {
      return Result.fail(new Error('currentDate deve ser uma data válida'))
    }

    const diffMs = currentDate.getTime() - checkoutDate.getTime()
    if (diffMs < 0) {
      return Result.fail(new Error('currentDate não pode ser anterior a checkoutDate'))
    }

    const daysSinceCheckout = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    let motivo: string | null = null

    if (daysSinceCheckout <= REACTIVATION_THRESHOLD_DAYS) {
      motivo = `Apenas ${daysSinceCheckout} dias desde o último check-out. Mínimo necessário: ${REACTIVATION_THRESHOLD_DAYS + 1} dias.`
    }

    if (!lgpdPermiteReativacao(consentimentoLGPD)) {
      const motivoLGPD = 'Hóspede sem consentimento LGPD para reativação comercial.'
      motivo = motivo ? `${motivo} ${motivoLGPD}` : motivoLGPD
    }

    const isEligible = daysSinceCheckout > REACTIVATION_THRESHOLD_DAYS && lgpdPermiteReativacao(consentimentoLGPD)

    return Result.ok(new ReactivationEligibility(isEligible, daysSinceCheckout, checkoutDate, consentimentoLGPD, motivo))
  }
}
