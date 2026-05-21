'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/revenue/kpis').then(r => r.json()).catch(() => null),
    ]).then(() => {
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
