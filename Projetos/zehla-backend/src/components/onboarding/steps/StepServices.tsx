'use client';

import { motion } from 'framer-motion';
import { Wifi, Car, Coffee, Waves, AirVent, Tv, UtensilsCrossed, Sparkles, Shirt, Bus, Check } from 'lucide-react';

export interface ServicesData {
  selected: string[];
}

interface StepServicesProps {
  data: ServicesData;
  onChange: (data: ServicesData) => void;
}

const services = [
{ id: 'wifi', label: 'WiFi Grátis', icon: Wifi, color: 'text-[#FF5500] bg-[#FF5500]/10 border-cyan-500/20' },
{ id: 'estacionamento', label: 'Estacionamento', icon: Car, color: 'text-[#898989] bg-neutral-500/10 border-neutral-500/20' },
{ id: 'cafe', label: 'Café da Manhã', icon: Coffee, color: 'text-[#FF5500] bg-[#FF5500]/10 border-amber-500/20' },
{ id: 'piscina', label: 'Piscina', icon: Waves, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
{ id: 'ar-condicionado', label: 'Ar-condicionado', icon: AirVent, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
{ id: 'tv', label: 'TV', icon: Tv, color: 'text-[#FF5500] bg-[#FF5500]/10 border-purple-500/20' },
{ id: 'mini-cozinha', label: 'Mini-cozinha', icon: UtensilsCrossed, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
{ id: 'restaurante', label: 'Restaurante', icon: UtensilsCrossed, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
{ id: 'spa', label: 'Spa / Bem-estar', icon: Sparkles, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
{ id: 'lavanderia', label: 'Lavanderia', icon: Shirt, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
{ id: 'transfer', label: 'Transfer / Shuttle', icon: Bus, color: 'text-[#FF5500] bg-[#FF5500]/10 border-orange-500/20' }];


export function StepServices({ data, onChange }: StepServicesProps) {
  const toggleService = (id: string) => {
    const newSelected = data.selected.includes(id) ? useMemo(() =>
    data.selected.filter((s) => s !== id), []) :
    [...data.selected, id];
    onChange({ selected: newSelected });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 text-sm text-[#FF5500]">
          <Sparkles className="w-4 h-4" />
          <span>Serviços & Comodidades</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa] mb-3">
          O que sua propriedade{' '}
          <span className="gradient-text">oferece?</span>
        </h2>
        <p className="text-[#898989] text-sm sm:text-base">
          Selecione os serviços disponíveis. O cérebro ZEHLA usará essas informações para o atendimento automatizado.
        </p>
      </div>

      {/* Service grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {services.map((service) => {
          const isSelected = data.selected.includes(service.id);
          return (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleService(service.id)}
              className={`relative p-4 rounded-xl border transition-all duration-200 text-left ${
              isSelected ?
              `bg-[#FF5500]/10 border-[#FF5500]/30 shadow-lg shadow-orange-500/5` :
              'glass-card border-[#2e2e2e] hover:border-[#363636]'}`
              }>
              
              {/* Check indicator */}
              {isSelected &&
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              }

              <div className={`inline-flex p-2.5 rounded-lg border mb-3 ${service.color}`}>
                <service.icon className="w-5 h-5" />
              </div>

              <div className={`text-sm font-medium ${isSelected ? 'text-orange-300' : 'text-[#b4b4b4]'}`}>
                {service.label}
              </div>
            </motion.button>);

        })}
      </div>

      {/* Counter */}
      <div className="text-center mt-6">
        <p className="text-sm text-[#4d4d4d]">
          {data.selected.length === 0 ?
          'Nenhum serviço selecionado' :
          `${data.selected.length} ${data.selected.length === 1 ? 'serviço selecionado' : 'serviços selecionados'}`}
        </p>
      </div>
    </motion.div>);

}