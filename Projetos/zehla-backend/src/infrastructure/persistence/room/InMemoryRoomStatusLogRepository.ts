import { RoomStatusLog } from '../../../domain/room/entities/RoomStatusLog'
import { IRoomStatusLogRepository } from '../../../application/room/ports/IRoomStatusLogRepository'

export class InMemoryRoomStatusLogRepository implements IRoomStatusLogRepository {
  private logs = new Map<string, RoomStatusLog>()

  async save(log: RoomStatusLog): Promise<RoomStatusLog> {
    this.logs.set(log.id, log)
    return log
  }

  async findByRoomId(roomId: string): Promise<RoomStatusLog[]> {
    return Array.from(this.logs.values())
      .filter((l) => l.roomId === roomId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async findLastByRoomId(roomId: string): Promise<RoomStatusLog | null> {
    const logs = await this.findByRoomId(roomId)
    return logs.length > 0 ? logs[0] : null
  }

  clear(): void {
    this.logs.clear()
  }
}
