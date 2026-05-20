'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Bed, User, Wrench, AlertTriangle, Lock, X } from 'lucide-react';
import type { Room } from '@/lib/store';

const statusConfig: Record<string, { color: string; label: string; icon: typeof Bed; borderColor: string }> = {
  available: { color: 'text-[#FF5500]', label: 'Disponível', icon: Bed, borderColor: 'border-orange-500/20' },
  occupied: { color: 'text-blue-400', label: 'Ocupado', icon: User, borderColor: 'border-blue-500/20' },
  dirty: { color: 'text-[#FF5500]', label: 'Sujo', icon: AlertTriangle, borderColor: 'border-amber-500/20' },
  maintenance: { color: 'text-red-400', label: 'Manutenção', icon: Wrench, borderColor: 'border-red-500/20' },
  reserved: { color: 'text-[#FF5500]', label: 'Reservado', icon: Lock, borderColor: 'border-purple-500/20' },
};

const typeColors: Record<string, string> = {
  Standard: 'bg-neutral-500/20 text-[#898989]',
  Superior: 'bg-blue-500/20 text-blue-400',
  Deluxe: 'bg-[#FF5500]/10 text-[#FF5500]',
  Suite: 'bg-purple-500/20 text-[#FF5500]',
  Premium: 'bg-[#FF5500]/10 text-[#FF5500]',
};

interface RoomData {
  rooms: Room[];
  summary: {
    total: number;
    available: number;
    occupied: number;
    dirty: number;
    maintenance: number;
    reserved: number;
  };
}

export function RoomBoard() {
  const [data, setData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetch('/api/rooms')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const floors = Array.from({ length: 5 }, (_, i) => ({
    floor: i + 1,
    rooms: data.rooms.filter(r => r.floor === i + 1),
  }));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-3 overflow-x-auto zehla-scroll-x pb-2">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="glass-card px-4 py-2 flex items-center gap-2 whitespace-nowrap">
            <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
            <span className="text-xs text-[#4d4d4d]">{cfg.label}</span>
            <span className={`text-sm font-bold ${cfg.color}`}>{data.summary[key as keyof typeof data.summary]}</span>
          </div>
        ))}
      </div>

      {/* Floor grid */}
      <div className="space-y-4">
        {floors.map(({ floor, rooms: floorRooms }) => (
          <div key={floor} className="glass-card p-4">
            <div className="text-xs font-medium text-[#4d4d4d] mb-3">Andar {floor}</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {floorRooms.map((room) => {
                const cfg = statusConfig[room.status];
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}
                    className={`p-3 rounded-xl border ${cfg.borderColor} bg-white/[0.02] hover:bg-[#242424] transition-all duration-200 text-left`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-[#efefef]">{room.number}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[room.type]}`}>{room.type}</span>
                    </div>
                    <div className={`text-xs ${cfg.color} flex items-center gap-1`}>
                      <cfg.icon className="w-3 h-3" />
                      {cfg.label}
                    </div>
                    {room.currentGuest && (
                      <div className="text-[10px] text-[#4d4d4d] mt-1 truncate">{room.currentGuest}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Room detail dialog */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRoom(null)}>
          <div className="glass-strong rounded-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#efefef]">Quarto {selectedRoom.number}</h3>
              <button onClick={() => setSelectedRoom(null)} className="text-[#4d4d4d] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#4d4d4d]">Tipo</span>
                <span className="text-[#b4b4b4]">{selectedRoom.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4d4d4d]">Andar</span>
                <span className="text-[#b4b4b4]">{selectedRoom.floor}º</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4d4d4d]">Preço</span>
                <span className="text-[#FF5500] font-semibold">R$ {selectedRoom.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4d4d4d]">Status</span>
                <span className={statusConfig[selectedRoom.status].color}>{statusConfig[selectedRoom.status].label}</span>
              </div>
              {selectedRoom.currentGuest && (
                <div className="flex justify-between">
                  <span className="text-[#4d4d4d]">Hóspede</span>
                  <span className="text-[#b4b4b4]">{selectedRoom.currentGuest}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
