import { Result } from '../../../domain/shared/Result'
import { Money } from '../../../domain/reservation/value-objects/Money'
import { Payment } from '../../../domain/reservation/entities/Payment'
import { PaymentMethod } from '../../../domain/reservation/PaymentMethod'
import { IReservationRepository } from '../ports/IReservationRepository'
import { IPaymentRepository } from '../ports/IPaymentRepository'
import { IEventBus } from '../ports/IEventBus'

export interface LinkPaymentInput {
  reservationId: string
  propertyId: string
  amount: number
  method: PaymentMethod
  externalId?: string
}

export interface LinkPaymentOutput {
  paymentId: string
  reservationId: string
  status: string
}

export class LinkPaymentUseCase {
  constructor(
    private reservationRepo: IReservationRepository,
    private paymentRepo: IPaymentRepository,
    private eventBus: IEventBus
  ) {}

  async execute(input: LinkPaymentInput): Promise<Result<LinkPaymentOutput, string>> {
    const reservation = await this.reservationRepo.findById(input.reservationId)
    if (!reservation) {
      return Result.fail('Reserva não encontrada')
    }

    const amountResult = Money.create(input.amount)
    if (amountResult.isFail) return Result.fail(amountResult.error)

    const paymentId = crypto.randomUUID?.() ?? `${Date.now()}-pay-${Math.random().toString(36).slice(2)}`

    const paymentResult = Payment.create({
      id: paymentId,
      reservationId: input.reservationId,
      propertyId: input.propertyId,
      amount: amountResult.value,
      method: input.method,
      externalId: input.externalId,
    })

    if (paymentResult.isFail) return Result.fail(paymentResult.error)

    const payment = paymentResult.value
    const confirmResult = payment.confirm()
    if (confirmResult.isFail) return Result.fail(confirmResult.error)

    const linkResult = reservation.addPayment(payment)
    if (linkResult.isFail) return Result.fail(linkResult.error)

    const applyResult = reservation.applyPayment(amountResult.value)
    if (applyResult.isFail) return Result.fail(applyResult.error)

    await this.paymentRepo.save(payment)
    await this.reservationRepo.update(reservation)
    await this.eventBus.publishMany(reservation.events)
    reservation.clearEvents()

    return Result.ok({
      paymentId: payment.id,
      reservationId: reservation.id,
      status: payment.status,
    })
  }
}
