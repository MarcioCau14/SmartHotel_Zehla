'use client';

import { BedDouble } from 'lucide-react';

const rooms = [
  { number: '101', type: 'Standard', status: 'AVAILABLE' as const, price: 198 },
  { number: '102', type: 'Standard', status: 'OCCUPIED' as const, price: 198 },
  { number: '103', type: 'Standard', status: 'CLEANING' as const, price: 198 },
  { number: '201', type: 'Deluxe', status: 'AVAILABLE' as const, price: 298 },
  { number: '202', type: 'Deluxe', status: 'MAINTENANCE' as const, price: 298 },
  { number: '203', type: 'Deluxe', status: 'OCCUPIED' as const, price: 298 },
  { number: '301', type: 'Suíte', status: 'OCCUPIED' as const, price: 448 },
  { number: '302', type: 'Suíte', status: 'AVAILABLE' as const, price: 448 },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  AVAILABLE: { label: 'Disponível', color: 'border-emerald-500/30 bg-emerald-500/5', dot: 'bg-emerald-400' },
  OCCUPIED: { label: 'Ocupado', color: 'border-orange-500/30 bg-orange-500/5', dot: 'bg-orange-400' },
  CLEANING: { label: 'Limpeza', color: 'border-blue-500/30 bg-blue-500/5', dot: 'bg-blue-400' },
  MAINTENANCE: { label: 'Manutenção', color: 'border-rose-500/30 bg-rose-500/5', dot: 'bg-rose-400' },
};

export default function QuartosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <BedDouble className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-bold text-white">Mapa de Quartos</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map((room) => {
          const config = statusConfig[room.status];
          return (
            <div
              key={room.number}
              className={`rounded-2xl border p-5 ${config.color} transition-all hover:brightness-110`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-black text-white">#{room.number}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
              </div>
              <p className="text-xs text-neutral-500 mb-1">{room.type}</p>
              <p className="text-sm font-bold text-orange-400">R$ {room.price}</p>
              <p className="text-[10px] font-medium mt-2 text-neutral-500">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.dot}`} />
            {config.label}
          </div>
        ))}
      </div>
    </div>
  );
}
