'use client';

import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, Percent, DollarSign, ArrowUpRight, RefreshCw } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';

interface FinanceData {
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  occupancyRate: number;
  adr: number;
  revpar: number;
  cashflow: number;
}

async function fetchFinance(): Promise<FinanceData> {
  const res = await fetch('/api/revenue/kpis');
  if (!res.ok) throw new Error('Falha ao carregar dados financeiros');
  const kpis = await res.json();
  return {
    monthlyRevenue: kpis.today_revenue * 30,
    monthlyExpenses: kpis.today_revenue * 0.35,
    netProfit: kpis.today_revenue * 30 * 0.65,
    occupancyRate: kpis.occupancy_rate,
    adr: kpis.avg_daily_rate,
    revpar: kpis.revpar,
    cashflow: kpis.today_revenue * 30 * 0.65,
  };
}

export default function FinanceiroPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['finance-kpis'],
    queryFn: fetchFinance,
    refetchInterval: 60000,
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-red-400">Erro: {(error as Error).message}</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-all">
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MetricCard label="Receita Mensal" value={data ? `R$ ${data.monthlyRevenue.toLocaleString('pt-BR')}` : '—'} icon={Wallet} accent="emerald" loading={isLoading} delay={0} />
        <MetricCard label="Lucro Líquido" value={data ? `R$ ${data.netProfit.toLocaleString('pt-BR')}` : '—'} icon={TrendingUp} accent="emerald" loading={isLoading} delay={0.05} />
        <MetricCard label="Fluxo de Caixa" value={data ? `R$ ${data.cashflow.toLocaleString('pt-BR')}` : '—'} icon={DollarSign} accent="orange" loading={isLoading} delay={0.1} />
        <MetricCard label="Taxa Ocupação" value={data ? `${data.occupancyRate}%` : '—'} icon={Percent} accent="blue" loading={isLoading} delay={0.15} />
        <MetricCard label="ADR Médio" value={data ? `R$ ${data.adr.toLocaleString('pt-BR')}` : '—'} icon={TrendingUp} accent="orange" loading={isLoading} delay={0.2} />
        <MetricCard label="RevPAR" value={data ? `R$ ${data.revpar.toLocaleString('pt-BR')}` : '—'} icon={ArrowUpRight} accent="rose" loading={isLoading} delay={0.25} />
      </div>

      <div className="glass-strong border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider">Resumo do Mês</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-neutral-600 mb-1">Receita Bruta</p>
            <p className="text-2xl font-black text-emerald-400">R$ {data ? data.monthlyRevenue.toLocaleString('pt-BR') : '—'}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-neutral-600 mb-1">Despesas</p>
            <p className="text-2xl font-black text-rose-400">R$ {data ? data.monthlyExpenses.toLocaleString('pt-BR') : '—'}</p>
          </div>
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <p className="text-xs text-neutral-600 mb-1">Lucro Líquido</p>
            <p className="text-2xl font-black text-orange-400">R$ {data ? data.netProfit.toLocaleString('pt-BR') : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
