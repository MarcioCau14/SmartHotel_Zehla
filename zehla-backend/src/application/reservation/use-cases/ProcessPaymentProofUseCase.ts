import { Result } from '../../../domain/shared/Result'
import { Reservation } from '../../../domain/reservation/entities/Reservation'
import { Payment } from '../../../domain/reservation/entities/Payment'
import { Money } from '../../../domain/reservation/value-objects/Money'
import { ReservationStatus } from '../../../domain/reservation/ReservationStatus'
import { PaymentMethod } from '../../../domain/reservation/PaymentMethod'
import { IReservationRepository } from '../ports/IReservationRepository'
import { IPaymentRepository } from '../ports/IPaymentRepository'
import { IEventBus } from '../ports/IEventBus'

export interface ProcessPaymentProofInput {
  phone: string
  propertyId: string
  amount: number
  transactionId: string
  contextReservationId?: string
}

export interface ProcessPaymentProofOutput {
  reservationId: string
  paymentId: string
  amount: number
}

export class ProcessPaymentProofUseCase {
  constructor(
    private reservationRepo: IReservationRepository,
    private paymentRepo: IPaymentRepository,
    private eventBus: IEventBus
  ) {}

  async execute(input: ProcessPaymentProofInput): Promise<Result<ProcessPaymentProofOutput, string>> {
    let reservation: Reservation | null = null

    if (input.contextReservationId && input.contextReservationId !== 'UNKNOWN') {
      reservation = await this.reservationRepo.findById(input.contextReservationId)
    } else {
      const reservations = await this.reservationRepo.findByGuestPhone(
        input.phone,
        input.propertyId,
        [ReservationStatus.AWAITING_PAYMENT]
      )
      reservation = reservations[0] ?? null
    }

    if (!reservation) {
      return Result.fail('Reserva não encontrada para este número.')
    }

    const amountResult = Money.create(input.amount)
    if (amountResult.isFail) {
      return Result.fail(amountResult.error)
    }

    const paymentResult = Payment.create({
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      reservationId: reservation.id,
      propertyId: input.propertyId,
      amount: amountResult.value,
      method: PaymentMethod.PIX,
      externalId: input.transactionId,
    })
    if (paymentResult.isFail) {
      return Result.fail(paymentResult.error)
    }

    const payment = paymentResult.value
    const confirmResult = payment.confirm()
    if (confirmResult.isFail) {
      return Result.fail(confirmResult.error)
    }

    const linkResult = reservation.addPayment(payment)
    if (linkResult.isFail) {
      return Result.fail(linkResult.error)
    }

    const applyResult = reservation.applyPayment(amountResult.value)
    if (applyResult.isFail) {
      return Result.fail(applyResult.error)
    }

    if (reservation.status === ReservationStatus.AWAITING_PAYMENT && reservation.isPaid) {
      const confirmReservationResult = reservation.confirm()
      if (confirmReservationResult.isFail) {
        return Result.fail(confirmReservationResult.error)
      }
    }

    await this.reservationRepo.update(reservation)
    await this.paymentRepo.save(payment)
    await this.eventBus.publishMany(reservation.events)
    reservation.clearEvents()

    return Result.ok({
      reservationId: reservation.id,
      paymentId: payment.id,
      amount: input.amount,
    })
  }
}
