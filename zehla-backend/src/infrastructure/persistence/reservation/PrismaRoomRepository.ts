import { PrismaClient } from '@prisma/client'
import { IRoomRepository, RoomData, RoomStatus, RoomType } from '../../../application/reservation/ports/IRoomRepository'

export class PrismaRoomRepository implements IRoomRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<RoomData | null> {
    const row = await this.prisma.room.findUnique({ where: { id } })
    if (!row) return null
    return this.toData(row)
  }

  async findByProperty(propertyId: string): Promise<RoomData[]> {
    const rows = await this.prisma.room.findMany({
      where: { propertyId },
      orderBy: { number: 'asc' },
    })
    return rows.map(this.toData)
  }

  async findAvailable(propertyId: string, minCapacity?: number): Promise<RoomData[]> {
    const where: any = {
      propertyId,
      status: 'AVAILABLE',
    }
    if (minCapacity) where.capacity = { gte: minCapacity }
    const rows = await this.prisma.room.findMany({ where, orderBy: { number: 'asc' } })
    return rows.map(this.toData)
  }

  async updateStatus(id: string, status: RoomStatus): Promise<void> {
    await this.prisma.room.update({
      where: { id },
      data: { status: status as any },
    })
  }

  private toData(row: any): RoomData {
    return {
      id: row.id,
      number: row.number,
      name: row.name ?? undefined,
      type: row.type as RoomType,
      capacity: row.capacity,
      basePrice: row.basePrice,
      status: row.status as RoomStatus,
      propertyId: row.propertyId,
    }
  }
}
