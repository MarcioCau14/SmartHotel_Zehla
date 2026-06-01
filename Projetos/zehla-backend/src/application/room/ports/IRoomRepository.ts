import { Room } from '../../../domain/room/entities/Room'
import { RoomType, RoomStatus } from '../../../domain/room/enums'

export interface RoomFilters {
  type?: RoomType
  status?: RoomStatus
  minCapacity?: number
  pricingType?: string
  search?: string
  limit?: number
  offset?: number
}

export interface IRoomRepository {
  save(room: Room): Promise<Room>
  update(room: Room): Promise<Room>
  findById(id: string): Promise<Room | null>
  findByNumber(propertyId: string, number: string): Promise<Room | null>
  findByProperty(propertyId: string, filters?: RoomFilters): Promise<Room[]>
  findByStatus(propertyId: string, status: RoomStatus): Promise<Room[]>
  findByType(propertyId: string, type: RoomType): Promise<Room[]>
  count(propertyId: string, filters?: RoomFilters): Promise<number>
  delete(id: string): Promise<void>
}
