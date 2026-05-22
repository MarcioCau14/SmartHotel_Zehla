'use client';

import { CalendarDays, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ReservasPage() {
  return (
    <div className="space-y-6">
      <div className="glass-strong border border-white/5 rounded-2xl p-8 md:p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
          <CalendarDays className="w-8 h-8 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Gestão de Reservas</h2>
        <p className="text-neutral-500 max-w-md mx-auto mb-8">
          Visualize, crie e gerencie todas as reservas da sua pousada em uma timeline interativa.
        </p>
        <Link
          href="/cliente/reservas/nova"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/20"
        >
          Nova Reserva
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Placeholder para a timeline de reservas */}
      <div className="glass-strong border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider">Próximas Reservas</h3>
        <div className="text-center py-12">
          <p className="text-sm text-neutral-600">Nenhuma reserva nos próximos dias</p>
        </div>
      </div>
    </div>
  );
}
