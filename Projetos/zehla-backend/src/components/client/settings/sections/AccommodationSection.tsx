'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, BedDouble } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { darkInput, amenityOptions, type AccommodationType } from '../types';

interface Props {
  types: AccommodationType[];
  onChange: (types: AccommodationType[]) => void;
}

export function AccommodationSection({ types, onChange }: Props) {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(2);
  const [price, setPrice] = useState(300);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const add = () => {
    if (!name.trim()) return;
    const newType: AccommodationType = {
      id: `at-${Date.now()}`,
      name: name.trim(),
      capacity,
      basePrice: price,
      amenities: selectedAmenities
    };
    onChange([...types, newType]);
    setName('');
    setCapacity(2);
    setPrice(300);
    setSelectedAmenities([]);
    setShowAdd(false);
    toast({ title: 'Tipo adicionado', description: `"${newType.name}" foi adicionado com sucesso.` });
  };

  const remove = (id: string) => {
    onChange(types.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-3 mt-2">
      {types.map((type) => (
        <motion.div
          key={type.id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-[#fafafa]">{type.name}</span>
                <Badge variant="outline" className="bg-[#FF5500]/10 text-[#FF5500] border-purple-500/20 text-[10px]">
                  {type.capacity} hóspede{type.capacity > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="text-sm text-[#FF5500] font-medium mb-2">
                R$ {type.basePrice.toLocaleString('pt-BR')},00 <span className="text-[#4d4d4d] text-xs">/noite</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {type.amenities.map((amenityKey) => {
                  const amenity = amenityOptions.find((a) => a.key === amenityKey);
                  if (!amenity) return null;
                  return (
                    <span key={amenityKey} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#242424] text-[10px] text-[#898989]">
                      <amenity.icon className="w-3 h-3" />
                      {amenity.label}
                    </span>
                  );
                })}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-[#363636] hover:text-red-400 hover:bg-red-500/10 shrink-0" onClick={() => remove(type.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      ))}

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white/[0.02] border border-dashed border-[#FF5500]/30 rounded-xl p-4 space-y-3"
          >
            <div className="text-xs font-semibold text-[#FF5500]">Novo Tipo de Acomodação</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder="Nome do tipo" value={name} onChange={(e) => setName(e.target.value)} className={darkInput} />
              <Input type="number" placeholder="Capacidade" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className={darkInput} />
              <Input type="number" placeholder="Preço base (R$)" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={darkInput} />
            </div>
            <div>
              <div className="text-[10px] text-[#4d4d4d] mb-2">Comodidades</div>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => toggleAmenity(a.key)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      selectedAmenities.includes(a.key)
                        ? 'bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/30'
                        : 'bg-[#242424] text-[#4d4d4d] border border-[#363636] hover:bg-[#2e2e2e]'
                    }`}
                  >
                    <a.icon className="w-3 h-3" />
                    {a.label}
                  </button>
                ))}
              </div>
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
          className="w-full border-dashed border-[#363636] text-[#4d4d4d] hover:text-[#FF5500] hover:border-[#FF5500]/30 hover:bg-orange-500/5"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4" />
          Adicionar Tipo de Acomodação
        </Button>
      )}
    </div>
  );
}
