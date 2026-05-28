import { RoomMaintenance } from '../../../domain/room/entities/RoomMaintenance'
import { RoomDateRange } from '../../../domain/room/value-objects/RoomDateRange'

export interface IRoomMaintenanceRepository {
  save(maintenance: RoomMaintenance): Promise<RoomMaintenance>
  update(maintenance: RoomMaintenance): Promise<RoomMaintenance>
  findById(id: string): Promise<RoomMaintenance | null>
  findByRoomId(roomId: string): Promise<RoomMaintenance[]>
  findActiveByRoomId(roomId: string): Promise<RoomMaintenance | null>
  findScheduledInPeriod(propertyId: string, dateRange: RoomDateRange): Promise<RoomMaintenance[]>
  delete(id: string): Promise<void>
}
