export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  BLOCKED = 'BLOCKED',
}

export enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  MASTER = 'MASTER',
  FAMILY = 'FAMILY',
}

export interface RoomData {
  id: string
  number: string
  name?: string
  type: RoomType
  capacity: number
  basePrice: number
  status: RoomStatus
  propertyId: string
}

export interface IRoomRepository {
  findById(id: string): Promise<RoomData | null>
  findByProperty(propertyId: string): Promise<RoomData[]>
  findAvailable(propertyId: string, minCapacity?: number): Promise<RoomData[]>
  updateStatus(id: string, status: RoomStatus): Promise<void>
}
