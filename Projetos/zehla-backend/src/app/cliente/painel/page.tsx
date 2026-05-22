'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, DollarSign, Clock, Percent, TrendingUp, BedDouble, RefreshCw } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';

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
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-red-400">Erro ao carregar dados: {(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
      <div className="glass-strong border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Nova Reserva', href: '/dashboard/reservas', accent: 'border-orange-500/20 hover:bg-orange-500/5' },
            { label: 'Mapa de Quartos', href: '/dashboard/quartos', accent: 'border-emerald-500/20 hover:bg-emerald-500/5' },
            { label: 'Relatório Financeiro', href: '/dashboard/financeiro', accent: 'border-blue-500/20 hover:bg-blue-500/5' },
            { label: 'Criar Promoção', href: '/dashboard/promocoes', accent: 'border-rose-500/20 hover:bg-rose-500/5' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`flex items-center justify-center p-4 rounded-xl bg-white/[0.02] border ${action.accent} transition-all text-sm font-medium text-neutral-400 hover:text-white text-center`}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>

      {/* Atividade Recente */}
      <div className="glass-strong border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider">Atividade Recente</h3>
        <div className="space-y-3">
          {[
            { time: '10:32', text: 'Nova reserva — João Pereira (Quarto 101)', type: 'emerald' },
            { time: '09:15', text: 'Check-out — Fernanda Costa (Quarto 102)', type: 'neutral' },
            { time: '08:47', text: 'IA respondeu pergunta sobre Wi-Fi via WhatsApp', type: 'orange' },
            { time: '08:00', text: 'Alerta: Ocupação abaixo da meta hoje', type: 'rose' },
          ].map((activity, i) => (
            <div key={i} className="flex items-start gap-3 py-2">
              <span className="text-[10px] font-mono text-neutral-700 mt-0.5 w-10 shrink-0">{activity.time}</span>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                activity.type === 'emerald' ? 'bg-emerald-500' :
                activity.type === 'orange' ? 'bg-orange-500' :
                activity.type === 'rose' ? 'bg-rose-500' :
                'bg-neutral-700'
              }`} />
              <p className="text-sm text-neutral-400">{activity.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
