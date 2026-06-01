import { Result } from '../../../domain/shared/Result'
import { IReservationRepository, ReservationFilters } from '../ports/IReservationRepository'

export interface ListReservationsInput {
  propertyId?: string
  status?: string
  startDate?: string
  endDate?: string
  guestPhone?: string
}

export interface ListReservationsOutput {
  reservations: Array<{
    id: string
    code: string
    guestName: string
    guestPhone: string
    roomId: string
    checkIn: string
    checkOut: string
    status: string
    totalAmount: number
    paidAmount: number
    source: string
  }>
  total: number
}

export class ListReservationsUseCase {
  constructor(private reservationRepo: IReservationRepository) {}

  async execute(input: ListReservationsInput): Promise<Result<ListReservationsOutput, string>> {
    const filters: ReservationFilters = {}

    if (input.propertyId) filters.propertyId = input.propertyId
    if (input.status && input.status !== 'all') {
      filters.status = input.status as any
    }
    if (input.startDate) filters.startDate = new Date(input.startDate)
    if (input.endDate) filters.endDate = new Date(input.endDate)
    if (input.guestPhone) filters.guestPhone = input.guestPhone

    const reservations = await this.reservationRepo.findMany(filters)

    return Result.ok({
      reservations: reservations.map((r) => ({
        id: r.id,
        code: r.code,
        guestName: r.guestInfo.name,
        guestPhone: r.guestInfo.phone,
        roomId: r.roomId,
        checkIn: r.period.checkIn.toISOString(),
        checkOut: r.period.checkOut.toISOString(),
        status: r.status,
        totalAmount: r.pricing.total.amount,
        paidAmount: r.paidAmount.amount,
        source: r.source,
      })),
      total: reservations.length,
    })
  }
}
