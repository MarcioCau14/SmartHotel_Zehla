'use client';

import { BedDouble } from 'lucide-react';
import { motion } from 'framer-motion';

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

const statusConfig: Record<string, { label: string; border: string; bg: string; dot: string; shadow: string }> = {
  AVAILABLE: { 
    label: 'Disponível', 
    border: 'border-[#00FF88]/15', 
    bg: 'bg-[#00FF88]/5', 
    dot: 'bg-[#00FF88]',
    shadow: 'hover:border-[#00FF88]/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.06)]'
  },
  OCCUPIED: { 
    label: 'Ocupado', 
    border: 'border-[#FF5500]/15', 
    bg: 'bg-[#FF5500]/5', 
    dot: 'bg-[#FF5500]',
    shadow: 'hover:border-[#FF5500]/30 hover:shadow-[0_0_20px_rgba(255,85,0,0.06)]'
  },
  CLEANING: { 
    label: 'Limpeza', 
    border: 'border-[#00CCFF]/15', 
    bg: 'bg-[#00CCFF]/5', 
    dot: 'bg-[#00CCFF]',
    shadow: 'hover:border-[#00CCFF]/30 hover:shadow-[0_0_20px_rgba(0,204,255,0.06)]'
  },
  MAINTENANCE: { 
    label: 'Manutenção', 
    border: 'border-[#FF3366]/15', 
    bg: 'bg-[#FF3366]/5', 
    dot: 'bg-[#FF3366]',
    shadow: 'hover:border-[#FF3366]/30 hover:shadow-[0_0_20px_rgba(255,51,102,0.06)]'
  },
};

export default function QuartosPage() {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-2"
      >
        <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center border border-[#FF5500]/25">
          <BedDouble className="w-4 h-4 text-[#FF5500]" />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight uppercase">Mapa de Quartos</h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map((room, idx) => {
          const config = statusConfig[room.status];
          return (
            <motion.div
              key={room.number}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className={`rounded-2xl border bg-[#0a0a0c]/60 p-5 backdrop-blur-md transition-all duration-300 ${config.border} ${config.shadow} group hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-black text-white tracking-tight">#{room.number}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${config.dot} shadow-[0_0_8px_currentColor]`} style={{ color: config.dot.replace('bg-[', '').replace(']', '') }} />
              </div>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">{room.type}</p>
              <p className="text-sm font-black text-[#FF5500]">R$ {room.price}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${config.bg}`} style={{ color: config.dot.replace('bg-[', '').replace(']', '') }}>
                  {config.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legenda */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest pt-4 border-t border-white/5"
      >
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.dot}`} />
            {config.label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
