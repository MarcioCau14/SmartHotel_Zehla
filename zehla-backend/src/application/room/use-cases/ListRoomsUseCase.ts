import { Result } from '../../../domain/shared/Result'
import { roomToOutput, RoomOutput } from './RoomOutput'
import { IRoomRepository, RoomFilters } from '../ports/IRoomRepository'

export interface ListRoomsInput {
  propertyId: string
  type?: string
  status?: string
  minCapacity?: number
  search?: string
  includeStats?: boolean
}

export interface ListRoomsOutput {
  rooms: RoomOutput[]
  stats?: {
    total: number
    available: number
    occupied: number
    occupancyRate: number
  }
}

export class ListRoomsUseCase {
  constructor(private roomRepo: IRoomRepository) {}

  async execute(input: ListRoomsInput): Promise<Result<ListRoomsOutput, string>> {
    if (!input.propertyId) return Result.fail('propertyId é obrigatório')

    const filters: RoomFilters = {}
    if (input.type) filters.type = input.type as any
    if (input.status) filters.status = input.status as any
    if (input.minCapacity !== undefined) filters.minCapacity = input.minCapacity
    if (input.search) filters.search = input.search

    const rooms = await this.roomRepo.findByProperty(input.propertyId, filters)
    const output: ListRoomsOutput = {
      rooms: rooms.map(roomToOutput),
    }

    if (input.includeStats) {
      const allRooms = await this.roomRepo.findByProperty(input.propertyId)
      const available = allRooms.filter((r) => r.status === 'AVAILABLE').length
      const occupied = allRooms.filter((r) => r.status === 'OCCUPIED').length
      const total = allRooms.length
      output.stats = {
        total,
        available,
        occupied,
        occupancyRate: total > 0 ? Math.round((occupied / total) * 10000) / 100 : 0,
      }
    }

    return Result.ok(output)
  }
}
