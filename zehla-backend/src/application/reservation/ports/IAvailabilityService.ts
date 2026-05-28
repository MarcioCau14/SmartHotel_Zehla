import { DateRange } from '../../../domain/reservation/value-objects/DateRange'
import { RoomData } from './IRoomRepository'

export interface IAvailabilityService {
  isRoomAvailable(
    roomId: string,
    period: DateRange,
    excludeReservationId?: string
  ): Promise<boolean>

  findAvailableRooms(
    propertyId: string,
    period: DateRange,
    minCapacity?: number
  ): Promise<RoomData[]>

  canAcceptReservation(
    propertyId: string,
    period: DateRange
  ): Promise<{ allowed: boolean; reason?: string }>
}
