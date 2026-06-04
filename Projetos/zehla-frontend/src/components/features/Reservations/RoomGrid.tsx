import { STATUS_META } from '@/types/reservation'
import type { RoomView } from '@/types/reservation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RoomGridProps {
  readonly rooms: ReadonlyArray<RoomView>
  readonly onRoomClick?: (roomId: string) => void
}

function RoomCard({
  room,
  onClick,
}: {
  room: RoomView
  onClick?: (id: string) => void
}) {
  const meta = STATUS_META[room.status]

  return (
    <Card
      data-slot="room-card"
      data-status={room.status}
      className={onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}
      onClick={() => onClick?.(room.id)}
    >
      <CardContent className="space-y-2 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{room.numero}</span>
          <Badge variant="outline" className={meta.cor}>
            <span className="mr-1">{meta.icone}</span>
            {meta.label}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">{room.tipo}</p>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {room.capacidade} hóspedes
          </span>
          <span className="font-medium">
            US$ {room.precoDiaria.toFixed(2)}
          </span>
        </div>

        {room.hospedeAtual && (
          <p className="truncate text-xs font-medium text-blue-600 dark:text-blue-400">
            {room.hospedeAtual}
          </p>
        )}

        <div className="flex gap-1 text-[10px] text-muted-foreground">
          {room.checkinHoje && <span>IN: {room.checkinHoje}</span>}
          {room.checkoutHoje && room.checkinHoje && <span>•</span>}
          {room.checkoutHoje && <span>OUT: {room.checkoutHoje}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

export function RoomGrid({ rooms, onRoomClick }: RoomGridProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed p-12">
        <p className="text-sm text-muted-foreground">Nenhum quarto cadastrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-400" />
          <span className="text-muted-foreground">
            Disponíveis ({rooms.filter((r) => r.status === 'available').length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-400" />
          <span className="text-muted-foreground">
            Ocupados ({rooms.filter((r) => r.status === 'occupied').length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-amber-400" />
          <span className="text-muted-foreground">
            Limpeza ({rooms.filter((r) => r.status === 'cleaning').length})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} onClick={onRoomClick} />
        ))}
      </div>
    </div>
  )
}
