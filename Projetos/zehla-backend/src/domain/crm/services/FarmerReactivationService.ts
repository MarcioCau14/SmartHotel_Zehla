import { Result } from '../../../shared/Result'
import { LeadProfile } from '../models/LeadProfile'
import { ReservationSnapshot } from '../models/ReservationSnapshot'
import { ReactivationEligibility } from '../models/ReactivationEligibility'
import { ReactivationCandidate } from '../models/ReactivationCandidate'

export class FarmerReactivationService {
  execute(
    lead: LeadProfile,
    reservations: ReservationSnapshot[],
    currentDate: Date,
  ): Result<ReactivationCandidate | null, Error> {
    if (!lead) {
      return Result.fail(new Error('Lead é obrigatório'))
    }
    if (!reservations || reservations.length === 0) {
      return Result.ok(null)
    }

    const reservasDoLead = reservations.filter(r => r.leadId === lead.id)
    if (reservasDoLead.length === 0) {
      return Result.ok(null)
    }

    const temReservaFutura = reservasDoLead.some(r => r.status === 'FUTURE')
    if (temReservaFutura) {
      return Result.ok(null)
    }

    let eligibleCheckout: Date | null = null
    let maxDaysSinceCheckout = 0

    for (const reserva of reservasDoLead) {
      if (reserva.status !== 'COMPLETED') continue

      const eligibilityResult = ReactivationEligibility.evaluate(reserva.checkoutDate, currentDate)
      if (eligibilityResult.isFail) {
        return Result.fail(eligibilityResult.error)
      }

      if (eligibilityResult.value.isEligible && eligibilityResult.value.daysSinceCheckout > maxDaysSinceCheckout) {
        eligibleCheckout = reserva.checkoutDate
        maxDaysSinceCheckout = eligibilityResult.value.daysSinceCheckout
      }
    }

    if (!eligibleCheckout) {
      return Result.ok(null)
    }

    const candidateResult = ReactivationCandidate.create(lead.id, maxDaysSinceCheckout, eligibleCheckout)
    if (candidateResult.isFail) {
      return Result.fail(candidateResult.error)
    }

    return Result.ok(candidateResult.value)
  }
}
