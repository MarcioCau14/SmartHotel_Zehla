import { IRoomRepository, RoomData, RoomStatus } from '../../../application/reservation/ports/IRoomRepository'

export class InMemoryRoomRepository implements IRoomRepository {
  private rooms = new Map<string, RoomData>()

  async findById(id: string): Promise<RoomData | null> {
    return this.rooms.get(id) ?? null
  }

  async findByProperty(propertyId: string): Promise<RoomData[]> {
    return Array.from(this.rooms.values()).filter((r) => r.propertyId === propertyId)
  }

  async findAvailable(propertyId: string, minCapacity?: number): Promise<RoomData[]> {
    return Array.from(this.rooms.values()).filter((r) => {
      if (r.propertyId !== propertyId) return false
      if (r.status !== RoomStatus.AVAILABLE) return false
      if (minCapacity !== undefined && r.capacity < minCapacity) return false
      return true
    })
  }

  async updateStatus(id: string, status: RoomStatus): Promise<void> {
    const room = this.rooms.get(id)
    if (room) {
      this.rooms.set(id, { ...room, status })
    }
  }

  clear(): void {
    this.rooms.clear()
  }
}
