import { Room } from '../entities/Room'
import { RoomMaintenance } from '../entities/RoomMaintenance'
import { RoomDateRange } from '../value-objects/RoomDateRange'
import { OccupancyRate } from '../value-objects/OccupancyRate'
import { RoomStatus } from '../enums'

export interface AvailabilitySummary {
  total: number
  available: number
  occupied: number
  cleaning: number
  maintenance: number
  blocked: number
  occupancyRate: number
}

export class AvailabilityService {
  isRoomAvailable(
    room: Room,
    dateRange: RoomDateRange,
    reservationDateRanges: RoomDateRange[],
    maintenancePeriods: RoomDateRange[]
  ): boolean {
    if (room.status !== RoomStatus.AVAILABLE) return false

    for (const reservationRange of reservationDateRanges) {
      if (dateRange.overlaps(reservationRange)) return false
    }

    for (const maintenancePeriod of maintenancePeriods) {
      if (dateRange.overlaps(maintenancePeriod)) return false
    }

    return true
  }

  findAvailableRooms(
    rooms: Room[],
    dateRange: RoomDateRange,
    reservationsByRoom: Map<string, RoomDateRange[]>,
    maintenanceByRoom: Map<string, RoomDateRange[]>
  ): Room[] {
    return rooms.filter((room) =>
      this.isRoomAvailable(
        room,
        dateRange,
        reservationsByRoom.get(room.id) ?? [],
        maintenanceByRoom.get(room.id) ?? []
      )
    )
  }

  getAvailabilitySummary(
    rooms: Room[]
  ): AvailabilitySummary {
    const total = rooms.length
    let available = 0
    let occupied = 0
    let cleaning = 0
    let maintenance = 0
    let blocked = 0

    for (const room of rooms) {
      switch (room.status) {
        case RoomStatus.AVAILABLE:
          available++
          break
        case RoomStatus.OCCUPIED:
          occupied++
          break
        case RoomStatus.CLEANING:
          cleaning++
          break
        case RoomStatus.MAINTENANCE:
          maintenance++
          break
        case RoomStatus.BLOCKED:
          blocked++
          break
      }
    }

    const occupancyRate = total > 0
      ? Math.round((occupied / total) * 10000) / 100
      : 0

    return {
      total,
      available,
      occupied,
      cleaning,
      maintenance,
      blocked,
      occupancyRate,
    }
  }
}
