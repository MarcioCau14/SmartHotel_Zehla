import { Result } from '../../../shared/Result'

export class ReactivationCandidate {
  private constructor(
    public readonly leadId: string,
    public readonly daysSinceCheckout: number,
    public readonly checkoutDate: Date,
  ) {
    Object.freeze(this)
  }

  static create(leadId: string, daysSinceCheckout: number, checkoutDate: Date): Result<ReactivationCandidate, Error> {
    if (!leadId || leadId.trim().length === 0) {
      return Result.fail(new Error('leadId é obrigatório'))
    }
    if (daysSinceCheckout < 0) {
      return Result.fail(new Error('daysSinceCheckout não pode ser negativo'))
    }
    if (!(checkoutDate instanceof Date) || isNaN(checkoutDate.getTime())) {
      return Result.fail(new Error('checkoutDate deve ser uma data válida'))
    }

    return Result.ok(new ReactivationCandidate(leadId.trim(), daysSinceCheckout, checkoutDate))
  }
}
