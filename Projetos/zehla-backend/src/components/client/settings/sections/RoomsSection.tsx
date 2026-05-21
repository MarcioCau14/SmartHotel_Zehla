'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { darkInput, darkSelectTrigger, statusConfig, type Room, type RoomStatus, type AccommodationType } from '../types';

interface Props {
  rooms: Room[];
  types: AccommodationType[];
  onChange: (rooms: Room[]) => void;
  getTypeName: (typeId: string) => string;
}

export function RoomsSection({ rooms, types, onChange, getTypeName }: Props) {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [number, setNumber] = useState('');
  const [typeId, setTypeId] = useState('at-1');
  const [floor, setFloor] = useState(1);
  const [status, setStatus] = useState<RoomStatus>('disponivel');

  const add = () => {
    if (!number.trim()) return;
    const newRoom: Room = {
      id: `r-${Date.now()}`,
      number: number.trim(),
      typeId,
      floor,
      status
    };
    onChange([...rooms, newRoom]);
    setNumber('');
    setTypeId('at-1');
    setFloor(1);
    setStatus('disponivel');
    setShowAdd(false);
    toast({ title: 'Quarto adicionado', description: `Quarto ${newRoom.number} criado com sucesso.` });
  };

  const remove = (id: string) => {
    onChange(rooms.filter((r) => r.id !== id));
  };

  return (
    <div className="mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rooms.map((room) => {
          const st = statusConfig[room.status];
          return (
            <motion.div
              key={room.id}
              layout
              className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-3 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#fafafa]">#{room.number}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-[#363636] hover:text-red-400 hover:bg-red-500/10" onClick={() => remove(room.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#4d4d4d]">Tipo</span>
                  <span className="text-xs text-[#b4b4b4]">{getTypeName(room.typeId)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#4d4d4d]">Andar</span>
                  <span className="text-xs text-[#b4b4b4]">{room.floor}º</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#4d4d4d]">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border ${st.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor}`} />
                    {st.label}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mt-4 bg-white/[0.02] border border-dashed border-[#FF5500]/30 rounded-xl p-4 space-y-3"
          >
            <div className="text-xs font-semibold text-[#FF5500]">Novo Quarto</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input placeholder="Nº Quarto" value={number} onChange={(e) => setNumber(e.target.value)} className={darkInput} />
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger className={darkSelectTrigger}>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-[#363636]">
                  {types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Andar" value={floor} onChange={(e) => setFloor(Number(e.target.value))} className={darkInput} />
              <Select value={status} onValueChange={(v: RoomStatus) => setStatus(v)}>
                <SelectTrigger className={darkSelectTrigger}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-[#363636]">
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="ocupado">Ocupado</SelectItem>
                  <SelectItem value="sujo">Sujo</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={add} className="bg-orange-500 hover:bg-orange-600 text-white">Adicionar</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="text-[#898989]">Cancelar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showAdd && (
        <Button
          variant="outline"
          className="w-full border-dashed border-[#363636] text-[#4d4d4d] hover:text-[#FF5500] hover:border-[#FF5500]/30 hover:bg-orange-500/5 mt-4"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4" />
          Adicionar Quarto
        </Button>
      )}
    </div>
  );
}
