'use client';

import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, Percent, DollarSign, ArrowUpRight, RefreshCw, Landmark } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { motion } from 'framer-motion';

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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-64 gap-4 bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-8 backdrop-blur-md"
      >
        <p className="text-sm text-red-400 font-bold">Erro: {(error as Error).message}</p>
        <button 
          onClick={() => refetch()} 
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/25 text-[#FF5500] text-sm font-black uppercase tracking-wider hover:bg-[#FF5500]/20 hover:shadow-[0_0_15px_rgba(255,85,0,0.15)] transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" /> Tentar novamente
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center border border-[#FF5500]/25">
          <Landmark className="w-4 h-4 text-[#FF5500]" />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight uppercase">Financeiro</h2>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MetricCard label="Receita Mensal" value={data ? `R$ ${data.monthlyRevenue.toLocaleString('pt-BR')}` : '—'} icon={Wallet} accent="emerald" loading={isLoading} delay={0} />
        <MetricCard label="Lucro Líquido" value={data ? `R$ ${data.netProfit.toLocaleString('pt-BR')}` : '—'} icon={TrendingUp} accent="emerald" loading={isLoading} delay={0.05} />
        <MetricCard label="Fluxo de Caixa" value={data ? `R$ ${data.cashflow.toLocaleString('pt-BR')}` : '—'} icon={DollarSign} accent="orange" loading={isLoading} delay={0.1} />
        <MetricCard label="Taxa Ocupação" value={data ? `${data.occupancyRate}%` : '—'} icon={Percent} accent="blue" loading={isLoading} delay={0.15} />
        <MetricCard label="ADR Médio" value={data ? `R$ ${data.adr.toLocaleString('pt-BR')}` : '—'} icon={TrendingUp} accent="orange" loading={isLoading} delay={0.2} />
        <MetricCard label="RevPAR" value={data ? `R$ ${data.revpar.toLocaleString('pt-BR')}` : '—'} icon={ArrowUpRight} accent="rose" loading={isLoading} delay={0.25} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-[#0a0a0c]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md hover:border-white/10 transition-all duration-300"
      >
        <h3 className="text-xs font-black text-neutral-400 mb-6 uppercase tracking-wider">Resumo do Mês</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#00FF88]/20 transition-all duration-300 group">
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-2 group-hover:text-neutral-400 transition-colors">Receita Bruta</p>
            <p className="text-3xl font-black text-[#00FF88] tracking-tight">R$ {data ? data.monthlyRevenue.toLocaleString('pt-BR') : '—'}</p>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#FF3366]/20 transition-all duration-300 group">
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-2 group-hover:text-neutral-400 transition-colors">Despesas</p>
            <p className="text-3xl font-black text-[#FF3366] tracking-tight">R$ {data ? data.monthlyExpenses.toLocaleString('pt-BR') : '—'}</p>
          </div>
          <div className="p-5 rounded-xl bg-[#FF5500]/5 border border-[#FF5500]/20 hover:border-[#FF5500]/40 hover:shadow-[0_0_20px_rgba(255,85,0,0.05)] transition-all duration-300 group">
            <p className="text-xs text-[#FF5500]/70 font-bold uppercase tracking-wider mb-2 group-hover:text-[#FF5500]/90 transition-colors">Lucro Líquido</p>
            <p className="text-3xl font-black text-[#FF5500] tracking-tight shadow-[#FF5500]/20">R$ {data ? data.netProfit.toLocaleString('pt-BR') : '—'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
