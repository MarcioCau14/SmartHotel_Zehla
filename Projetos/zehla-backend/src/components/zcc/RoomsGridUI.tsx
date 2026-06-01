'use client'

import type { RoomData } from '../../hooks/useRoomsGrid'
import { RoomCard } from './RoomCard'
import type { RoomOperationalStatus } from '../../hooks/useRoomsGrid'

export interface RoomsGridUIProps {
  rooms: RoomData[]
  isLoading: boolean
  error: string | null
  onStatusChange: (roomId: string, novoStatus: RoomOperationalStatus) => void
}

export function RoomsGridUI({ rooms, isLoading, error, onStatusChange }: RoomsGridUIProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 w-full text-slate-400 font-mono">
        <span className="animate-spin mr-2">⚙️</span> Carregando mapa de quartos...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="p-4 bg-red-950/20 border border-red-900 rounded text-red-400 text-xs font-mono">
          {error}
        </div>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 w-full text-slate-500 font-mono">
        <span>Nenhum quarto encontrado para esta propriedade.</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            roomId={room.id}
            numero={room.number}
            tipo={room.type}
            status={room.status}
            preco={room.basePrice}
            hospede={room.guestName}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  )
}
