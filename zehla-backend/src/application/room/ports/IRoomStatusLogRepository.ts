import { RoomStatusLog } from '../../../domain/room/entities/RoomStatusLog'

export interface IRoomStatusLogRepository {
  save(log: RoomStatusLog): Promise<RoomStatusLog>
  findByRoomId(roomId: string): Promise<RoomStatusLog[]>
  findLastByRoomId(roomId: string): Promise<RoomStatusLog | null>
}
