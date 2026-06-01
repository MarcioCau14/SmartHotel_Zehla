import { RoomMaintenance } from '../../../domain/room/entities/RoomMaintenance'
import { RoomDateRange } from '../../../domain/room/value-objects/RoomDateRange'
import { IRoomMaintenanceRepository } from '../../../application/room/ports/IRoomMaintenanceRepository'

export class InMemoryRoomMaintenanceRepository implements IRoomMaintenanceRepository {
  private items = new Map<string, RoomMaintenance>()

  async save(maintenance: RoomMaintenance): Promise<RoomMaintenance> {
    this.items.set(maintenance.id, maintenance)
    return maintenance
  }

  async update(maintenance: RoomMaintenance): Promise<RoomMaintenance> {
    this.items.set(maintenance.id, maintenance)
    return maintenance
  }

  async findById(id: string): Promise<RoomMaintenance | null> {
    return this.items.get(id) ?? null
  }

  async findByRoomId(roomId: string): Promise<RoomMaintenance[]> {
    return Array.from(this.items.values()).filter((m) => m.roomId === roomId)
  }

  async findActiveByRoomId(roomId: string): Promise<RoomMaintenance | null> {
    const now = new Date()
    for (const m of this.items.values()) {
      if (m.roomId === roomId && m.isActiveOn(now)) return m
    }
    return null
  }

  async findScheduledInPeriod(propertyId: string, dateRange: RoomDateRange): Promise<RoomMaintenance[]> {
    return Array.from(this.items.values()).filter((m) => {
      return m.period.overlaps(dateRange)
    })
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id)
  }

  clear(): void {
    this.items.clear()
  }
}
