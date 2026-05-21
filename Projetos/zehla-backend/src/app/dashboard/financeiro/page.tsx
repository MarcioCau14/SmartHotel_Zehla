'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Brain, ToggleLeft, ToggleRight, Calculator } from 'lucide-react';

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [revenueSettings, setRevenueSettings] = useState<any>(null);
  const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/revenue/kpis').then(r => r.json()).catch(() => null),
      fetch('/api/revenue/settings').then(r => r.json()).catch(() => null),
    ]).then(([, revenueResult]) => {
      if (revenueResult) {
        setRevenueData(revenueResult);
        setRevenueSettings(revenueResult.settings);
        setDynamicPricingEnabled(revenueResult.settings?.dynamicPricingEnabled || false);
      }
      // Fallback to seed data if API not ready
      setTransactions([
        { id: '1', type: 'INCOME', category: 'reserva', channel: 'direto', description: 'Reserva ZEH-2026-001 — João Pereira', amount: 2660, status: 'confirmed', date: new Date() },
        { id: '2', type: 'INCOME', category: 'reserva', channel: 'direto', description: 'Reserva ZEH-2026-002 — Ana Carolina', amount: 420, status: 'confirmed', date: new Date() },
        { id: '3', type: 'EXPENSE', category: 'limpeza', description: 'Equipe de limpeza — Semana 20', amount: -800, status: 'confirmed', date: new Date() },
        { id: '4', type: 'EXPENSE', category: 'manutencao', description: 'Reparo ar condicionado — Quarto 107', amount: -350, status: 'confirmed', date: new Date() },
        { id: '5', type: 'EXPENSE', category: 'marketing', channel: 'instagram', description: 'Ads Instagram — Maio', amount: -500, status: 'confirmed', date: new Date() },
        { id: '6', type: 'INCOME', category: 'reserva', channel: 'booking', description: 'Reserva Booking.com — Roberto Lima', amount: 1050, status: 'pending', date: new Date() },
      ]);
      setFinanceData({
        grossRevenue: 3080,
        netRevenue: 2464,
        occupancyRate: 37.5,
        adr: 270,
        revpar: 101.25,
        totalCosts: 1650,
      });
      setLoading(false);
    });
  }, []);

  const toggleDynamicPricing = async () => {
    const newValue = !dynamicPricingEnabled;
    setDynamicPricingEnabled(newValue);
    try {
      await fetch('/api/revenue/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dynamicPricingEnabled: newValue }),
      });
    } catch {}
  };

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-[#25D366]/20 border-t-[#25D366] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dash-page-title">Inteligência Financeira</h1>
        <p className="dash-page-subtitle">Visão geral de RevPAR, ADR e Fluxo de Caixa</p>
      </div>

      {/* KPIs */}
      <div className="dash-grid-4">
        <div className="dash-kpi">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}>
              <DollarSign className="w-5 h-5" style={{ color: '#25D366' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#111B21' }}>R$ {totalIncome.toLocaleString('pt-BR')}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Receita Bruta</p>
        </div>
        <div className="dash-kpi">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(234, 67, 53, 0.1)' }}>
              <TrendingDown className="w-5 h-5" style={{ color: '#EA4335' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#111B21' }}>R$ {totalExpense.toLocaleString('pt-BR')}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Despesas</p>
        </div>
        <div className="dash-kpi">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(18, 140, 126, 0.1)' }}>
              <Wallet className="w-5 h-5" style={{ color: '#128C7E' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#25D366' }}>R$ {balance.toLocaleString('pt-BR')}</p>
          <p className="text-sm" style={{ color: '#667781' }}>Saldo Líquido</p>
        </div>
        <div className="dash-kpi">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(7, 94, 84, 0.1)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#075E54' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#111B21' }}>R$ {financeData?.revpar || 0}</p>
          <p className="text-sm" style={{ color: '#667781' }}>RevPAR</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="dash-grid-3">
        <div className="dash-section">
          <p className="text-sm" style={{ color: '#667781' }}>ADR (Diária Média)</p>
          <p className="text-xl font-bold mt-1" style={{ color: '#111B21' }}>R$ {financeData?.adr || 0}</p>
        </div>
        <div className="dash-section">
          <p className="text-sm" style={{ color: '#667781' }}>Taxa de Ocupação</p>
          <p className="text-xl font-bold mt-1" style={{ color: '#111B21' }}>{financeData?.occupancyRate || 0}%</p>
        </div>
        <div className="dash-section">
          <p className="text-sm" style={{ color: '#667781' }}>Custos Operacionais</p>
          <p className="text-xl font-bold mt-1" style={{ color: '#EA4335' }}>R$ {financeData?.totalCosts || 0}</p>
        </div>
      </div>

      {/* Revenue Management Section */}
      <div className="dash-section">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}>
              <Brain className="w-5 h-5" style={{ color: '#25D366' }} />
            </div>
            <div>
              <h3 className="dash-section-title mb-0">Revenue Management — Precificação Dinâmica</h3>
              <p className="text-xs mt-0.5" style={{ color: '#8696A0' }}>IA ajusta preços automaticamente baseado em ocupação e demanda</p>
            </div>
          </div>
          <button
            onClick={toggleDynamicPricing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: dynamicPricingEnabled ? 'rgba(37, 211, 102, 0.1)' : '#F0F2F5',
              color: dynamicPricingEnabled ? '#25D366' : '#8696A0',
            }}
          >
            {dynamicPricingEnabled ? (
              <ToggleRight className="w-6 h-6" />
            ) : (
              <ToggleLeft className="w-6 h-6" />
            )}
            <span className="text-sm font-medium">{dynamicPricingEnabled ? 'Ativo' : 'Inativo'}</span>
          </button>
        </div>

        {/* Revenue Stats */}
        {revenueData?.stats && (
          <div className="dash-grid-3 mb-4">
            <div className="dash-section text-center">
              <p className="text-2xl font-bold" style={{ color: '#25D366' }}>
                R$ {revenueData.stats.extraRevenueGenerated.toFixed(2)}
              </p>
              <p className="text-xs mt-1" style={{ color: '#667781' }}>Receita Extra Gerada pela IA</p>
            </div>
            <div className="dash-section text-center">
              <p className="text-2xl font-bold" style={{ color: '#111B21' }}>
                {revenueData.stats.totalCalculations}
              </p>
              <p className="text-xs mt-1" style={{ color: '#667781' }}>Cálculos de Preço Realizados</p>
            </div>
            <div className="dash-section text-center">
              <p className="text-2xl font-bold" style={{ color: '#128C7E' }}>
                {(revenueData.stats.avgOccupancyRate * 100).toFixed(0)}%
              </p>
              <p className="text-xs mt-1" style={{ color: '#667781' }}>Ocupação Média nos Cálculos</p>
            </div>
          </div>
        )}

        {/* Pricing Thresholds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(234, 67, 53, 0.05)' }}>
            <p className="text-xs font-medium" style={{ color: '#EA4335' }}>Ocupação ≥ 90%</p>
            <p className="text-lg font-bold" style={{ color: '#111B21' }}>+30%</p>
            <p className="text-[10px]" style={{ color: '#8696A0' }}>Escassez Alta</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 183, 77, 0.1)' }}>
            <p className="text-xs font-medium" style={{ color: '#FFB74D' }}>Ocupação ≥ 70%</p>
            <p className="text-lg font-bold" style={{ color: '#111B21' }}>+15%</p>
            <p className="text-[10px]" style={{ color: '#8696A0' }}>Demanda Média</p>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(37, 211, 102, 0.05)' }}>
            <p className="text-xs font-medium" style={{ color: '#25D366' }}>Ocupação &lt; 30%</p>
            <p className="text-lg font-bold" style={{ color: '#111B21' }}>-10%</p>
            <p className="text-[10px]" style={{ color: '#8696A0' }}>Estímulo Baixa Demanda</p>
          </div>
        </div>

        {/* Recent Pricing Logs */}
        {revenueData?.pricingLogs && revenueData.pricingLogs.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2" style={{ color: '#667781' }}>Últimos Ajustes de Preço</h4>
            <div className="space-y-2">
              {revenueData.pricingLogs.slice(0, 5).map((log: any) => {
                const diff = log.finalPrice - log.originalPrice;
                const isIncrease = diff > 0;
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                    <div className="flex items-center gap-3">
                      <Calculator className="w-4 h-4" style={{ color: isIncrease ? '#25D366' : '#EA4335' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#111B21' }}>
                          R$ {log.originalPrice} → R$ {log.finalPrice}
                        </p>
                        <p className="text-xs" style={{ color: '#8696A0' }}>
                          {new Date(log.createdAt).toLocaleDateString('pt-BR')} · Ocupação {(log.occupancyRate * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: isIncrease ? '#25D366' : '#EA4335' }}>
                        {isIncrease ? '+' : ''}{diff.toFixed(0)}%
                      </p>
                      <p className="text-[10px]" style={{ color: '#8696A0' }}>{log.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Transactions table */}
      <div className="dash-section overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-[#E9EDEF]">
          <h3 className="dash-section-title mb-0">Transações Recentes</h3>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Canal</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>
                  <p className="text-sm font-medium" style={{ color: '#111B21' }}>{t.description}</p>
                  <p className="text-xs" style={{ color: '#8696A0' }}>{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                </td>
                <td>
                  <span className="text-sm capitalize" style={{ color: '#667781' }}>{t.category}</span>
                </td>
                <td>
                  <span className="text-sm" style={{ color: '#667781' }}>{t.channel || '—'}</span>
                </td>
                <td className={`text-sm font-semibold flex items-center gap-1 ${t.amount > 0 ? '' : ''}`} style={{ color: t.amount > 0 ? '#25D366' : '#EA4335' }}>
                  {t.amount > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  R$ {Math.abs(t.amount).toLocaleString('pt-BR')}
                </td>
                <td>
                  <span className={`dash-status ${t.status === 'confirmed' ? 'dash-status-green' : 'dash-status-yellow'}`}>
                    {t.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
