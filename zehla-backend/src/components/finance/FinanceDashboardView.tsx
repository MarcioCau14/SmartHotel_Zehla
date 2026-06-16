'use client';

import { useState, useEffect } from 'react';
import { FinanceHero } from './FinanceHero';
import { FinanceChat } from './FinanceChat';
import { 
  AlertTriangle, Check, Loader2, Calendar, 
  TrendingUp, BarChart3, Wallet, Info 
} from 'lucide-react';

export interface FinanceDashboardViewProps {
  propertyId: string;
}

interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  createdAt: string;
}

interface DashboardData {
  period: number;
  summary: {
    totalRevenue: number;
    totalCosts: number;
    profit: number;
    profitMargin: number;
    avgOccupancy: number;
    avgADR: number;
    avgRevPAR: number;
  };
  chartData: Array<{
    date: string;
    revenue: number;
    costs: number;
    occupancy: number;
    adr: number;
  }>;
  alerts: Alert[];
  aiInsight: string;
  healthScore: number;
}

export function FinanceDashboardView({ propertyId }: FinanceDashboardViewProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/zcc/finance/dashboard?propertyId=${propertyId}&days=${days}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'Falha ao buscar dados do painel financeiro.');
      }
    } catch (err) {
      setError('Erro de conexão ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [propertyId, days]);

  const handleDismissAlert = async (alertId: string) => {
    setDismissingId(alertId);
    try {
      const res = await fetch('/api/zcc/finance/alerts/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      const json = await res.json();
      if (json.success) {
        // Remove localmente o alerta
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            alerts: prev.alerts.filter((a) => a.id !== alertId),
          };
        });
      }
    } catch (err) {
      console.error('Erro ao ler alerta:', err);
    } finally {
      setDismissingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="w-full h-96 border border-neutral-800 bg-neutral-950/20 rounded-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="text-xs text-neutral-500 font-mono tracking-widest uppercase">CARREGANDO CAIXA REAL...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 border border-red-500/20 bg-red-500/5 rounded-2xl text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-sm font-bold text-neutral-200">Falha na Conexão</h3>
        <p className="text-xs text-neutral-500">{error}</p>
        <button 
          onClick={fetchDashboard} 
          className="text-xs bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl transition-colors font-mono"
        >
          REAVALIAR
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-500" />
            ZEHLA Finance
          </h2>
          <p className="text-xs text-neutral-500">Módulo de Gestão de Caixa Inteligente</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 font-mono">FILTRAR PERÍODO:</span>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
            className="bg-[#121212] border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-orange-500/50"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={15}>Últimos 15 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* Finance Hero */}
      <FinanceHero 
        summary={data.summary}
        aiInsight={data.aiInsight}
        healthScore={data.healthScore}
        alertCount={data.alerts.length}
      />

      {/* Main Grid: Charts, Alerts and Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Charts and Alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom Revenue vs Costs Chart */}
          <div className="border border-neutral-800 bg-[#0c0c0c] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-xs font-mono font-bold text-neutral-300 uppercase">Fluxo de Caixa Operacional</h4>
                <span className="text-[10px] text-neutral-500">Comparação diária entre Receita Líquida e Custos Totais</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded"></span>
                  <span className="text-neutral-400">Receita</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded"></span>
                  <span className="text-neutral-400">Custos</span>
                </div>
              </div>
            </div>

            {data.chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center border border-dashed border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-600 font-mono">SEM DADOS GRÁFICOS NO PERÍODO</span>
              </div>
            ) : (
              <div className="h-48 flex items-end gap-2 px-2 pt-4 relative">
                {/* Chart Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-white/5 pb-8">
                  <div className="w-full border-t border-white/5"></div>
                  <div className="w-full border-t border-white/5"></div>
                  <div className="w-full border-t border-white/5"></div>
                </div>

                {data.chartData.map((d, i) => {
                  const maxVal = Math.max(...data.chartData.map(x => Math.max(x.revenue, x.costs)), 1);
                  const revHeight = (d.revenue / maxVal) * 100;
                  const costHeight = (d.costs / maxVal) * 100;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 bg-[#121212] border border-neutral-800 text-[10px] p-2 rounded-lg font-mono text-neutral-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 w-28 text-center shadow-2xl">
                        <span className="block text-neutral-500 border-b border-white/5 pb-1 mb-1">{d.date}</span>
                        <span className="block text-emerald-400">Rec: R$ {d.revenue.toFixed(0)}</span>
                        <span className="block text-red-400">Cust: R$ {d.costs.toFixed(0)}</span>
                      </div>

                      <div className="w-full flex items-end gap-1 h-3/4 justify-center">
                        <div 
                          style={{ height: `${Math.max(revHeight, 4)}%` }}
                          className="w-2 rounded-t bg-emerald-500 transition-all duration-300"
                        />
                        <div 
                          style={{ height: `${Math.max(costHeight, 4)}%` }}
                          className="w-2 rounded-t bg-red-500 transition-all duration-300"
                        />
                      </div>
                      
                      {/* X Axis Label */}
                      <span className="text-[8px] text-neutral-600 font-mono mt-1 hidden md:block">
                        {d.date.substring(8, 10)}/{d.date.substring(5, 7)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Alerts List */}
          <div className="border border-neutral-800 bg-[#0c0c0c] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h4 className="text-xs font-mono font-bold text-neutral-300 uppercase">Alertas Financeiros do Swarm</h4>
              <span className="text-[9px] font-mono text-neutral-500 uppercase">Alertas Ativos</span>
            </div>

            {data.alerts.length === 0 ? (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-sans">Todos os fechamentos e custos estão em conformidade com as metas.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {data.alerts.map((alert) => {
                  const isCritical = alert.severity === 'CRITICAL';
                  const isWarning = alert.severity === 'WARNING';
                  const alertColor = isCritical 
                    ? 'border-red-500/20 bg-red-500/5 text-red-400' 
                    : isWarning 
                    ? 'border-amber-500/20 bg-amber-500/5 text-amber-400' 
                    : 'border-blue-500/20 bg-blue-500/5 text-blue-400';

                  return (
                    <div 
                      key={alert.id}
                      className={`border rounded-xl p-4 flex items-start justify-between gap-4 transition-all ${alertColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-neutral-200">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[9px] text-neutral-500 font-mono">
                            <span className="uppercase">FONTE: {alert.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{new Date(alert.createdAt).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        disabled={dismissingId === alert.id}
                        className="p-1 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors shrink-0 disabled:opacity-50"
                      >
                        {dismissingId === alert.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right: Finance Chat */}
        <div className="lg:col-span-1">
          <FinanceChat propertyId={propertyId} />
        </div>

      </div>
    </div>
  );
}
