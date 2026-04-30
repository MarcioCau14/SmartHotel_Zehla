'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, Plus, Trash2, Users, DollarSign } from 'lucide-react';

export interface RoomData {
  id: string;
  nome: string;
  tipo: string;
  pricingType: 'PER_ROOM' | 'PER_PERSON';
  capacidade: number;
  preco: number;
}

interface StepRoomsProps {
  data: RoomData[];
  onChange: (data: RoomData[]) => void;
}

const tiposQuarto = [
  { value: 'standard', label: 'Standard' },
  { value: 'luxo', label: 'Luxo' },
  { value: 'suite', label: 'Suíte' },
  { value: 'chale', label: 'Chalé' },
];

const tipoColors: Record<string, string> = {
  standard: 'text-[#898989] bg-neutral-500/10 border-neutral-500/20',
  luxo: 'text-[#FF5500] bg-[#FF5500]/10 border-amber-500/20',
  suite: 'text-[#FF5500] bg-[#FF5500]/10 border-purple-500/20',
  chale: 'text-[#FF5500] bg-[#FF5500]/10 border-orange-500/20',
};

let idCounter = 1;
function generateId() {
  return `room-${idCounter++}-${Date.now()}`;
}

export function StepRooms({ data, onChange }: StepRoomsProps) {
  const addRoom = () => {
    const newRoom: RoomData = {
      id: generateId(),
      nome: `${data.length + 1}`,
      tipo: 'standard',
      pricingType: 'PER_ROOM',
      capacidade: 2,
      preco: 150,
    };
    onChange([...data, newRoom]);
  };

  const removeRoom = (id: string) => {
    if (data.length <= 1) return;
    onChange(data.filter((r) => r.id !== id));
  };

  const updateRoom = (id: string, field: keyof RoomData, value: string | number) => {
    onChange(
      data.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 text-sm text-[#FF5500]">
          <BedDouble className="w-4 h-4" />
          <span>Configuração de Quartos</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa] mb-3">
          Configure seus{' '}
          <span className="gradient-text">quartos</span>
        </h2>
        <p className="text-[#898989] text-sm sm:text-base">
          Adicione os tipos de acomodação disponíveis. O cérebro ZEHLA usará isso para precificação dinâmica.
        </p>
      </div>

      {/* Room cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {data.map((room, index) => (
            <motion.div
              key={room.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#363636] font-mono">#{index + 1}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${tipoColors[room.tipo] || tipoColors.standard}`}>
                    {tiposQuarto.find((t) => t.value === room.tipo)?.label || 'Standard'}
                  </span>
                </div>
                {data.length > 1 && (
                  <button
                    onClick={() => removeRoom(room.id)}
                    className="p-1.5 rounded-lg text-[#363636] hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Nome/Número */}
                <div>
                  <label className="block text-xs text-[#4d4d4d] mb-1">Nome / Número</label>
                  <input
                    type="text"
                    value={room.nome}
                    onChange={(e) => updateRoom(room.id, 'nome', e.target.value)}
                    placeholder="101"
                    className="w-full px-3 py-2.5 bg-[#242424] border border-[#363636] rounded-lg text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-xs text-[#4d4d4d] mb-1">Tipo</label>
                  <select
                    value={room.tipo}
                    onChange={(e) => updateRoom(room.id, 'tipo', e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#242424] border border-[#363636] rounded-lg text-sm text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all appearance-none cursor-pointer"
                  >
                    {tiposQuarto.map((t) => (
                      <option key={t.value} value={t.value} className="bg-neutral-900">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Tipo de Cobrança */}
                <div>
                  <label className="block text-xs text-[#4d4d4d] mb-1">Cobrança</label>
                  <select
                    value={room.pricingType}
                    onChange={(e) => updateRoom(room.id, 'pricingType', e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#242424] border border-[#363636] rounded-lg text-sm text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="PER_ROOM" className="bg-neutral-900">Por Quarto</option>
                    <option value="PER_PERSON" className="bg-neutral-900">Por Pessoa</option>
                  </select>
                </div>

                {/* Capacidade */}
                <div>
                  <label className="block text-xs text-[#4d4d4d] mb-1">
                    <Users className="w-3 h-3 inline mr-0.5" /> Capacidade
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={room.capacidade}
                    onChange={(e) => updateRoom(room.id, 'capacidade', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2.5 bg-[#242424] border border-[#363636] rounded-lg text-sm text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                  />
                </div>

                {/* Preço */}
                <div>
                  <label className="block text-xs text-[#4d4d4d] mb-1">
                    <DollarSign className="w-3 h-3 inline mr-0.5" /> Preço / Noite
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#4d4d4d]">R$</span>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={room.preco}
                      onChange={(e) => updateRoom(room.id, 'preco', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2.5 bg-[#242424] border border-[#363636] rounded-lg text-sm text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add room button */}
      <button
        onClick={addRoom}
        className="w-full mt-4 py-3 border border-dashed border-[#363636] rounded-xl text-sm text-[#4d4d4d] hover:text-[#FF5500] hover:border-[#FF5500]/30 hover:bg-orange-500/5 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Adicionar Tipo de Acomodação
      </button>
    </motion.div>
  );
}
