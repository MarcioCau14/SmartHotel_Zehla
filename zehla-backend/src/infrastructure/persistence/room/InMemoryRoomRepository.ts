import { Room } from '../../../domain/room/entities/Room'
import { RoomType, RoomStatus } from '../../../domain/room/enums'
import { IRoomRepository, RoomFilters } from '../../../application/room/ports/IRoomRepository'

export class InMemoryRoomRepository implements IRoomRepository {
  private rooms = new Map<string, Room>()

  async save(room: Room): Promise<Room> {
    this.rooms.set(room.id, room)
    return room
  }

  async update(room: Room): Promise<Room> {
    this.rooms.set(room.id, room)
    return room
  }

  async findById(id: string): Promise<Room | null> {
    return this.rooms.get(id) ?? null
  }

  async findByNumber(propertyId: string, number: string): Promise<Room | null> {
    for (const room of this.rooms.values()) {
      if (room.propertyId === propertyId && room.number === number) return room
    }
    return null
  }

  async findByProperty(propertyId: string, filters?: RoomFilters): Promise<Room[]> {
    let result = Array.from(this.rooms.values()).filter((r) => r.propertyId === propertyId)
    if (filters) {
      if (filters.type) result = result.filter((r) => r.type === filters.type)
      if (filters.status) result = result.filter((r) => r.status === filters.status)
      if (filters.minCapacity !== undefined) result = result.filter((r) => r.capacity.maxTotal >= filters.minCapacity!)
      if (filters.pricingType) result = result.filter((r) => r.pricingType === filters.pricingType)
      if (filters.search) {
        const q = filters.search.toLowerCase()
        result = result.filter((r) => r.number.toLowerCase().includes(q) || r.name?.toLowerCase().includes(q))
      }
    }
    result.sort((a, b) => a.number.localeCompare(b.number))
    return result
  }

  async findByStatus(propertyId: string, status: RoomStatus): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(
      (r) => r.propertyId === propertyId && r.status === status
    )
  }

  async findByType(propertyId: string, type: RoomType): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(
      (r) => r.propertyId === propertyId && r.type === type
    )
  }

  async count(propertyId: string, filters?: RoomFilters): Promise<number> {
    const items = await this.findByProperty(propertyId, filters)
    return items.length
  }

  async delete(id: string): Promise<void> {
    this.rooms.delete(id)
  }

  clear(): void {
    this.rooms.clear()
  }
}
