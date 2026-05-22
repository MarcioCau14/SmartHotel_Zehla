'use client';

import { CalendarDays, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ReservasPage() {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center border border-[#FF5500]/25">
          <Calendar className="w-4 h-4 text-[#FF5500]" />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight uppercase">Gestão de Reservas</h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-8 md:p-12 text-center backdrop-blur-md hover:border-[#FF5500]/20 hover:shadow-[0_0_30px_rgba(255,85,0,0.02)] transition-all duration-300"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#FF5500]/10 flex items-center justify-center mx-auto mb-6 border border-[#FF5500]/20 shadow-[0_0_15px_rgba(255,85,0,0.05)]">
          <CalendarDays className="w-8 h-8 text-[#FF5500]" />
        </div>
        <h3 className="text-2xl font-black text-white tracking-tight mb-3">Gestão de Reservas</h3>
        <p className="text-neutral-500 max-w-md mx-auto mb-8 text-sm">
          Visualize, crie e gerencie todas as reservas da sua pousada em uma timeline interativa guiada por inteligência artificial.
        </p>
        <Link
          href="/cliente/reservas/nova"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FF5500]/20 hover:shadow-[#FF5500]/30 hover:scale-105 duration-300"
        >
          Nova Reserva
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Placeholder para a timeline de reservas */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md"
      >
        <h4 className="text-xs font-black text-neutral-400 mb-6 uppercase tracking-wider">Próximas Reservas</h4>
        <div className="text-center py-12 border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
          <p className="text-xs text-neutral-600 font-bold uppercase tracking-wider">Nenhuma reserva cadastrada para os próximos dias</p>
        </div>
      </motion.div>
    </div>
  );
}
