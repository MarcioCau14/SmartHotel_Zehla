'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, DollarSign, Clock, Percent, TrendingUp, BedDouble, RefreshCw } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import Link from 'next/link';

interface KPI {
  active_guests: number;
  today_revenue: number;
  pending_checkins: number;
  occupancy_rate: number;
  avg_daily_rate: number;
  total_rooms: number;
  revpar: number;
}

async function fetchKPIs(): Promise<KPI> {
  const res = await fetch('/api/revenue/kpis');
  if (!res.ok) throw new Error('Falha ao carregar KPIs');
  return res.json();
}

export default function PainelPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: fetchKPIs,
    refetchInterval: 30000,
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 bg-[#0a0a0c]/60 border border-white/5 rounded-2xl backdrop-blur-md">
        <p className="text-sm text-red-400">Erro ao carregar dados: {(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/25 text-[#FF5500] text-sm font-medium hover:bg-[#FF5500]/20 transition-all duration-300 shadow-[0_0_15px_rgba(255,85,0,0.1)]"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Hóspedes Ativos"
          value={data ? String(data.active_guests) : '—'}
          icon={Users}
          accent="orange"
          loading={isLoading}
          delay={0}
        />
        <MetricCard
          label="Receita Hoje"
          value={data ? `R$ ${data.today_revenue.toLocaleString('pt-BR')}` : '—'}
          icon={DollarSign}
          accent="emerald"
          loading={isLoading}
          delay={0.05}
        />
        <MetricCard
          label="Check-ins Pendentes"
          value={data ? String(data.pending_checkins) : '—'}
          icon={Clock}
          accent="rose"
          loading={isLoading}
          delay={0.1}
        />
        <MetricCard
          label="Taxa de Ocupação"
          value={data ? `${data.occupancy_rate}%` : '—'}
          icon={Percent}
          accent="blue"
          loading={isLoading}
          delay={0.15}
        />
        <MetricCard
          label="ADR Médio"
          value={data ? `R$ ${data.avg_daily_rate.toLocaleString('pt-BR')}` : '—'}
          icon={TrendingUp}
          accent="orange"
          loading={isLoading}
          delay={0.2}
        />
        <MetricCard
          label="RevPAR"
          value={data ? `R$ ${data.revpar.toLocaleString('pt-BR')}` : '—'}
          icon={TrendingUp}
          accent="emerald"
          loading={isLoading}
          delay={0.25}
        />
        <MetricCard
          label="Total de Quartos"
          value={data ? String(data.total_rooms) : '—'}
          icon={BedDouble}
          accent="blue"
          loading={isLoading}
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-lg relative overflow-hidden">
        <h3 className="text-xs font-bold text-neutral-500 mb-4 uppercase tracking-wider">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 z-10 relative">
          {[
            { label: 'Nova Reserva', href: '/cliente/reservas', style: 'border-[#FF5500]/15 hover:border-[#FF5500]/30 hover:bg-[#FF5500]/5 text-neutral-400 hover:text-white shadow-[0_0_10px_rgba(255,85,0,0.02)] hover:shadow-[0_0_15px_rgba(255,85,0,0.06)]' },
            { label: 'Mapa de Quartos', href: '/cliente/quartos', style: 'border-[#00FF88]/15 hover:border-[#00FF88]/30 hover:bg-[#00FF88]/5 text-neutral-400 hover:text-white shadow-[0_0_10px_rgba(0,255,136,0.02)] hover:shadow-[0_0_15px_rgba(0,255,136,0.06)]' },
            { label: 'Relatório Financeiro', href: '/cliente/financeiro', style: 'border-[#00CCFF]/15 hover:border-[#00CCFF]/30 hover:bg-[#00CCFF]/5 text-neutral-400 hover:text-white shadow-[0_0_10px_rgba(0,204,255,0.02)] hover:shadow-[0_0_15px_rgba(0,204,255,0.06)]' },
            { label: 'Criar Promoção', href: '/cliente/promocoes', style: 'border-[#FF3366]/15 hover:border-[#FF3366]/30 hover:bg-[#FF3366]/5 text-neutral-400 hover:text-white shadow-[0_0_10px_rgba(255,51,102,0.02)] hover:shadow-[0_0_15px_rgba(255,51,102,0.06)]' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center justify-center p-4 rounded-xl bg-white/[0.01] border ${action.style} transition-all duration-300 text-sm font-semibold text-center`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Atividade Recente */}
      <div className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-lg">
        <h3 className="text-xs font-bold text-neutral-500 mb-4 uppercase tracking-wider">Atividade Recente</h3>
        <div className="space-y-4">
          {[
            { time: '10:32', text: 'Nova reserva — João Pereira (Quarto 101)', type: 'emerald', glow: 'shadow-[0_0_8px_#00FF88]' },
            { time: '09:15', text: 'Check-out — Fernanda Costa (Quarto 102)', type: 'neutral', glow: '' },
            { time: '08:47', text: 'IA respondeu pergunta sobre Wi-Fi via WhatsApp', type: 'orange', glow: 'shadow-[0_0_8px_#FF5500]' },
            { time: '08:00', text: 'Alerta: Ocupação abaixo da meta hoje', type: 'rose', glow: 'shadow-[0_0_8px_#FF3366]' },
          ].map((activity, i) => (
            <div key={i} className="flex items-start gap-4 py-1.5 border-b border-white/[0.02] last:border-b-0">
              <span className="text-[10px] font-mono text-neutral-600 mt-1 w-10 shrink-0">{activity.time}</span>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activity.glow} ${
                activity.type === 'emerald' ? 'bg-[#00FF88]' :
                activity.type === 'orange' ? 'bg-[#FF5500]' :
                activity.type === 'rose' ? 'bg-[#FF3366]' :
                'bg-neutral-700'
              }`} />
              <p className="text-sm text-neutral-400 group-hover:text-neutral-300">{activity.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
