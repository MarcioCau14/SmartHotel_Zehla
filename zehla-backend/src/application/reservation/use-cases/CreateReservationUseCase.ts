import { Result } from '../../../domain/shared/Result'
import { Reservation } from '../../../domain/reservation/entities/Reservation'
import { DateRange } from '../../../domain/reservation/value-objects/DateRange'
import { Money } from '../../../domain/reservation/value-objects/Money'
import { GuestCount } from '../../../domain/reservation/value-objects/GuestCount'
import { GuestInfo } from '../../../domain/reservation/value-objects/GuestInfo'
import { IReservationRepository } from '../ports/IReservationRepository'
import { IRoomRepository, RoomData } from '../ports/IRoomRepository'
import { IPricingService } from '../ports/IPricingService'
import { IAvailabilityService } from '../ports/IAvailabilityService'
import { IEventBus } from '../ports/IEventBus'

export interface CreateReservationInput {
  propertyId: string
  roomId: string
  guestName: string
  guestEmail?: string
  guestPhone: string
  guestCpf?: string
  guestCount: number
  checkIn: string
  checkOut: string
  discount?: number
  source?: string
  notes?: string
}

export interface CreateReservationOutput {
  id: string
  code: string
  status: string
  totalAmount: number
  nights: number
  roomNumber: string
}

export class CreateReservationUseCase {
  constructor(
    private reservationRepo: IReservationRepository,
    private roomRepo: IRoomRepository,
    private pricingService: IPricingService,
    private availabilityService: IAvailabilityService,
    private eventBus: IEventBus
  ) {}

  async execute(input: CreateReservationInput): Promise<Result<CreateReservationOutput, string>> {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

    const room = await this.roomRepo.findById(input.roomId)
    if (!room) {
      return Result.fail('Quarto não encontrado')
    }
    if (room.status === 'MAINTENANCE' || room.status === 'BLOCKED') {
      return Result.fail('Quarto está em manutenção ou bloqueado')
    }

    const periodResult = DateRange.createFromStrings(input.checkIn, input.checkOut)
    if (periodResult.isFail) return Result.fail(periodResult.error)

    const guestCountResult = GuestCount.create(input.guestCount)
    if (guestCountResult.isFail) return Result.fail(guestCountResult.error)

    if (guestCountResult.value.exceedsCapacity(room.capacity)) {
      return Result.fail(`Capacidade do quarto excedida: máximo ${room.capacity} hóspedes`)
    }

    const guestInfoResult = GuestInfo.create({
      name: input.guestName,
      email: input.guestEmail,
      phone: input.guestPhone,
      cpf: input.guestCpf,
    })
    if (guestInfoResult.isFail) return Result.fail(guestInfoResult.error)

    const isAvailable = await this.availabilityService.isRoomAvailable(
      input.roomId,
      periodResult.value
    )
    if (!isAvailable) {
      return Result.fail('Quarto não disponível para as datas selecionadas')
    }

    const basePrice = Money.create(room.basePrice).getOrElse(Money.ZERO)
    const pricing = await this.pricingService.calculatePrice(
      basePrice,
      periodResult.value.nights,
      input.guestCount,
      room.type,
      input.propertyId,
      periodResult.value
    )

    const discount = input.discount
      ? Money.create(input.discount).getOrElse(Money.ZERO)
      : Money.ZERO

    const finalPricing = pricing // pricing já inclui regras e desconto

    const reservationResult = Reservation.create({
      id,
      propertyId: input.propertyId,
      roomId: input.roomId,
      guestInfo: guestInfoResult.value,
      guestCount: guestCountResult.value,
      period: periodResult.value,
      pricing: finalPricing,
      source: input.source,
      notes: input.notes,
    })

    if (reservationResult.isFail) {
      return Result.fail(reservationResult.error)
    }

    const reservation = reservationResult.value
    await this.reservationRepo.save(reservation)
    await this.eventBus.publishMany(reservation.events)
    reservation.clearEvents()

    return Result.ok({
      id: reservation.id,
      code: reservation.code,
      status: reservation.status,
      totalAmount: reservation.pricing.total.amount,
      nights: reservation.period.nights,
      roomNumber: room.number,
    })
  }
}
