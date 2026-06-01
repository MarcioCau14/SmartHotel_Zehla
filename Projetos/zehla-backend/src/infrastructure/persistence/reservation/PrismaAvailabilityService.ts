import { PrismaClient } from '@prisma/client'
import { DateRange } from '../../../domain/reservation/value-objects/DateRange'
import { IAvailabilityService } from '../../../application/reservation/ports/IAvailabilityService'
import { RoomData } from '../../../application/reservation/ports/IRoomRepository'
import { PrismaRoomRepository } from './PrismaRoomRepository'

export class PrismaAvailabilityService implements IAvailabilityService {
  private roomRepo: PrismaRoomRepository

  constructor(private prisma: PrismaClient) {
    this.roomRepo = new PrismaRoomRepository(prisma)
  }

  async isRoomAvailable(roomId: string, period: DateRange, excludeReservationId?: string): Promise<boolean> {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } })
    if (!room) return false
    if (room.status === 'MAINTENANCE' || room.status === 'BLOCKED') return false

    const where: any = {
      roomId,
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      OR: [
        { checkIn: { lt: period.checkOut }, checkOut: { gt: period.checkIn } },
      ],
    }
    if (excludeReservationId) where.id = { not: excludeReservationId }

    const overlapping = await this.prisma.reservation.findFirst({ where })
    return !overlapping
  }

  async findAvailableRooms(propertyId: string, period: DateRange, minCapacity?: number): Promise<RoomData[]> {
    const allRooms = await this.roomRepo.findAvailable(propertyId, minCapacity)
    const available: RoomData[] = []

    for (const room of allRooms) {
      const isAvail = await this.isRoomAvailable(room.id, period)
      if (isAvail) available.push(room)
    }

    return available
  }

  async canAcceptReservation(propertyId: string, _period: DateRange): Promise<{ allowed: boolean; reason?: string }> {
    const rooms = await this.prisma.room.count({ where: { propertyId, status: 'AVAILABLE' } })
    if (rooms === 0) {
      return { allowed: false, reason: 'Nenhum quarto disponível na propriedade' }
    }
    return { allowed: true }
  }
}
