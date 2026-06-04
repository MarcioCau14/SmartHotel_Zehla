'use client'

import { useRoomBoard } from '@/hooks/use-room-board'
import { RoomGrid } from '@/components/features/Reservations/RoomGrid'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorMessage } from '@/components/ui/error-message'

export default function ReservasPage() {
  const { rooms, isLoading, error, refresh, changeRoomStatus, isChangingStatus } = useRoomBoard(30_000)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <ErrorMessage message={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reservas</h1>
        {isChangingStatus && (
          <span className="text-sm text-muted-foreground">Atualizando...</span>
        )}
      </div>
      <RoomGrid
        rooms={rooms}
        onRoomClick={(roomId) => {
          const room = rooms.find((r) => r.id === roomId)
          if (room && room.status === 'available') {
            changeRoomStatus({ roomId, newStatus: 'cleaning' })
          }
        }}
      />
    </div>
  )
}
