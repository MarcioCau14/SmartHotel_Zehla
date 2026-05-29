import { Result } from '../../../domain/shared/Result'
import { RoomDateRange } from '../../../domain/room/value-objects/RoomDateRange'
import { AvailabilityService, AvailabilitySummary } from '../../../domain/room/services/AvailabilityService'
import { IRoomRepository } from '../ports/IRoomRepository'
import { IRoomMaintenanceRepository } from '../ports/IRoomMaintenanceRepository'

export interface CheckAvailabilityInput {
  propertyId: string
  checkIn?: string
  checkOut?: string
  guestCount?: number
}

export interface AvailableRoomOutput {
  id: string
  number: string
  name: string | undefined
  type: string
  capacity: { maxAdults: number; maxChildren: number; maxTotal: number }
  basePrice: number
}

export interface CheckAvailabilityOutput {
  rooms: AvailableRoomOutput[]
  stats: AvailabilitySummary
}

export class CheckAvailabilityUseCase {
  constructor(
    private roomRepo: IRoomRepository,
    private maintenanceRepo: IRoomMaintenanceRepository,
    private availabilityService: AvailabilityService
  ) {}

  async execute(input: CheckAvailabilityInput): Promise<Result<CheckAvailabilityOutput, string>> {
    if (!input.propertyId) return Result.fail('propertyId é obrigatório')

    const rooms = await this.roomRepo.findByProperty(input.propertyId)
    const stats = this.availabilityService.getAvailabilitySummary(rooms)

    let resultRooms = rooms

    if (input.checkIn && input.checkOut) {
      const rangeResult = RoomDateRange.create(
        new Date(input.checkIn),
        new Date(input.checkOut)
      )
      if (rangeResult.isFail) return Result.fail(rangeResult.error)

      const dateRange = rangeResult.value
      const maintenanceItems = await this.maintenanceRepo.findScheduledInPeriod(
        input.propertyId,
        dateRange
      )

      const maintenanceByRoom = new Map<string, RoomDateRange[]>()
      for (const m of maintenanceItems) {
        const existing = maintenanceByRoom.get(m.roomId) ?? []
        existing.push(m.period)
        maintenanceByRoom.set(m.roomId, existing)
      }

      resultRooms = this.availabilityService.findAvailableRooms(
        rooms,
        dateRange,
        new Map(),
        maintenanceByRoom
      )
    }

    return Result.ok({
      rooms: resultRooms.map((r) => ({
        id: r.id,
        number: r.number,
        name: r.name,
        type: r.type,
        capacity: r.capacity.toJSON(),
        basePrice: r.basePrice.amount,
      })),
      stats,
    })
  }
}
