import { PrismaClient } from '@prisma/client'
import { Room } from '../../../domain/room/entities/Room'
import { MonetaryValue } from '../../../domain/room/value-objects/MonetaryValue'
import { Capacity } from '../../../domain/room/value-objects/Capacity'
import { Amenities } from '../../../domain/room/value-objects/Amenities'
import { RoomType, RoomStatus } from '../../../domain/room/enums'
import { IRoomRepository, RoomFilters } from '../../../application/room/ports/IRoomRepository'

export class PrismaRoomRepository implements IRoomRepository {
  constructor(private prisma: PrismaClient) {}

  async save(room: Room): Promise<Room> {
    const data = room.toJSON()
    await this.prisma.room.create({
      data: {
        id: data.id,
        number: data.number,
        name: data.name,
        type: data.type as any,
        capacity: data.capacity.maxTotal,
        basePrice: data.basePrice.amount,
        pricingType: data.pricingType as any,
        amenities: data.amenities,
        status: data.status as any,
        description: data.description,
        images: data.images,
        propertyId: data.propertyId,
      },
    })
    return room
  }

  async update(room: Room): Promise<Room> {
    const data = room.toJSON()
    await this.prisma.room.update({
      where: { id: data.id },
      data: {
        number: data.number,
        name: data.name,
        type: data.type as any,
        capacity: data.capacity.maxTotal,
        basePrice: data.basePrice.amount,
        pricingType: data.pricingType as any,
        amenities: data.amenities,
        status: data.status as any,
        description: data.description,
        images: data.images,
      },
    })
    return room
  }

  async findById(id: string): Promise<Room | null> {
    const row = await this.prisma.room.findUnique({ where: { id } })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByNumber(propertyId: string, number: string): Promise<Room | null> {
    const row = await this.prisma.room.findFirst({
      where: { propertyId, number },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByProperty(propertyId: string, filters?: RoomFilters): Promise<Room[]> {
    const where: any = { propertyId }
    if (filters) {
      if (filters.type) where.type = filters.type
      if (filters.status) where.status = filters.status
      if (filters.search) {
        const q = filters.search
        where.OR = [
          { number: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ]
      }
    }

    const rows = await this.prisma.room.findMany({
      where,
      orderBy: { number: 'asc' },
      take: filters?.limit ?? 100,
      skip: filters?.offset,
    })

    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Room[]
  }

  async findByStatus(propertyId: string, status: RoomStatus): Promise<Room[]> {
    const rows = await this.prisma.room.findMany({
      where: { propertyId, status: status as any },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Room[]
  }

  async findByType(propertyId: string, type: RoomType): Promise<Room[]> {
    const rows = await this.prisma.room.findMany({
      where: { propertyId, type: type as any },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Room[]
  }

  async count(propertyId: string, filters?: RoomFilters): Promise<number> {
    const where: any = { propertyId }
    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    return this.prisma.room.count({ where })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.room.delete({ where: { id } })
  }

  private hydrate(row: any): Room | null {
    const capacityResult = Capacity.create(
      row.capacity ?? 2,
      0
    )
    if (capacityResult.isFail) return null

    const basePriceResult = MonetaryValue.create(row.basePrice ?? 0)
    if (basePriceResult.isFail) return null

    const amenitiesResult = Amenities.create(row.amenities ?? [])
    if (amenitiesResult.isFail) return null

    const id = row.id
    const roomResult = Room.create({
      id,
      number: row.number,
      name: row.name ?? undefined,
      type: (row.type as RoomType) ?? undefined,
      capacity: capacityResult.value,
      basePrice: basePriceResult.value,
      pricingType: (row.pricingType as any) ?? undefined,
      amenities: amenitiesResult.value,
      description: row.description ?? undefined,
      images: row.images ?? [],
      propertyId: row.propertyId,
    })
    if (roomResult.isFail) return null

    const room = roomResult.value
    ;(room as any).data.status = (row.status as RoomStatus) ?? RoomStatus.AVAILABLE

    return room
  }
}
