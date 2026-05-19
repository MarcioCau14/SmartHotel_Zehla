import { Users, DollarSign, Clock, TicketCheck, Percent, TrendingUp, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Skeleton } from '@/components/ui/skeleton';


'use client';


interface KPI {
  active_guests: number;
  today_revenue: number;
  pending_checkins: number;
  ai_tickets_resolved: number;
  ai_tickets_total: number;
  occupancy_rate: number;
  avg_daily_rate: number;
  revpar: number;
}

const kpiConfig = [
  { key: 'active_guests', label: 'Hóspedes Ativos', icon: Users, format: (v: number) => String(v), color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/10' },
  { key: 'today_revenue', label: 'Receita Hoje', icon: DollarSign, format: (v: number) => `R$ ${v.toLocaleString('pt-BR')}`, color: 'text-green-400', bg: 'bg-green-500/10' },
  { key: 'pending_checkins', label: 'Check-ins Pendentes', icon: Clock, format: (v: number) => String(v), color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/10' },
  { key: 'ai_tickets_resolved', label: 'Tickets IA Resolvidos', icon: TicketCheck, format: (v: number, d: KPI) => `${v}/${d.ai_tickets_total}`, color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/10' },
  { key: 'occupancy_rate', label: 'Taxa Ocupação', icon: Percent, format: (v: number) => `${v}%`, color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/10' },
  { key: 'avg_daily_rate', label: 'ADR Médio', icon: TrendingUp, format: (v: number) => `R$ ${v.toLocaleString('pt-BR')}`, color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

export function KPICards() : void {
  const [data, setData] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/revenue/kpis');
      if (!res.ok) throw new Error('Erro ao carregar KPIs');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (error) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiConfig.map((kpi, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchData} className="text-xs text-[#4d4d4d] hover:text-[#FF5500] mt-2">Tentar novamente</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))
        : data && kpiConfig.map((kpi, i) => (
            <div key={i} className="glass-card p-4 group hover:bg-[#242424] transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#4d4d4d]">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                </div>
              </div>
              <div className={`text-xl font-bold ${kpi.color}`}>
                {kpi.format(data[kpi.key as keyof KPI] as number, data)}
              </div>
            </div>
          ))
      }
      {!loading && data && (
        <button
          onClick={fetchData}
          className="glass-card p-4 flex items-center justify-center text-[#4d4d4d] hover:text-[#FF5500] hover:bg-[#242424] transition-all duration-200 col-span-2 lg:col-span-3"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          <span className="text-xs">Atualizar KPIs</span>
        </button>
      )}
    </div>
  );
}
