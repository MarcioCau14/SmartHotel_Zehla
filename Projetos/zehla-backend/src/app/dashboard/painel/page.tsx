'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Users, DollarSign, Clock, Percent, TrendingUp, MessageSquare, CalendarCheck, BedDouble } from 'lucide-react';

export default function PainelPage() {
  const { data: session } = useSession();
  const [propertyData, setPropertyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/properties/me')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setPropertyData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Hóspedes Hoje', value: '3', icon: Users, color: '#25D366', bg: 'rgba(37, 211, 102, 0.1)', change: '+12%' },
    { label: 'Receita Hoje', value: 'R$ 1.280', icon: DollarSign, color: '#128C7E', bg: 'rgba(18, 140, 126, 0.1)', change: '+8%' },
    { label: 'Check-ins Pendentes', value: '2', icon: Clock, color: '#FFB74D', bg: 'rgba(255, 183, 77, 0.15)', change: '' },
    { label: 'Taxa Ocupação', value: '67%', icon: Percent, color: '#25D366', bg: 'rgba(37, 211, 102, 0.1)', change: '+5%' },
    { label: 'ADR Médio', value: 'R$ 320', icon: TrendingUp, color: '#075E54', bg: 'rgba(7, 94, 84, 0.1)', change: '+3%' },
    { label: 'Msg WhatsApp', value: '47', icon: MessageSquare, color: '#25D366', bg: 'rgba(37, 211, 102, 0.1)', change: '+34%' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#25D366]/20 border-t-[#25D366] animate-spin" />
          <span className="text-sm" style={{ color: '#8696A0' }}>Carregando painel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="dash-page-title">
          Olá, {session?.user?.name?.split(' ')[0] || 'Proprietário'} 👋
        </h1>
        <p className="dash-page-subtitle">
          {propertyData?.name || 'Sua Pousada'} — Visão geral da operação
        </p>
      </div>

      {/* KPI Grid */}
      <div className="dash-grid-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="dash-kpi">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              {kpi.change && (
                <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', color: '#25D366' }}>
                  {kpi.change}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold" style={{ color: '#111B21' }}>{kpi.value}</p>
              <p className="text-sm mt-1" style={{ color: '#667781' }}>{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions + Recent activity */}
      <div className="dash-grid-2">
        {/* Quick actions */}
        <div className="dash-section">
          <h3 className="dash-section-title">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: CalendarCheck, label: 'Nova Reserva', color: '#25D366' },
              { icon: BedDouble, label: 'Mapa Quartos', color: '#128C7E' },
              { icon: MessageSquare, label: 'WhatsApp', color: '#075E54' },
              { icon: DollarSign, label: 'Financeiro', color: '#25D366' },
            ].map((action, i) => (
              <button
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl border border-[#E9EDEF] hover:border-[#25D366] hover:bg-[rgba(37,211,102,0.04)] transition-all text-left"
              >
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
                <span className="text-sm font-medium" style={{ color: '#111B21' }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="dash-section">
          <h3 className="dash-section-title">Atividade Recente</h3>
          <div className="space-y-4">
            {[
              { time: '10:32', text: 'Nova reserva — João Pereira (Quarto 101)', type: 'green' },
              { time: '09:15', text: 'Check-out — Fernanda Costa (Quarto 102)', type: 'gray' },
              { time: '08:47', text: 'WhatsApp IA respondeu pergunta sobre Wi-Fi', type: 'green' },
              { time: '08:00', text: 'Alerta: Ocupação abaixo da meta hoje', type: 'yellow' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs font-mono flex-shrink-0 mt-0.5" style={{ color: '#8696A0' }}>{activity.time}</span>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: activity.type === 'green' ? '#25D366' : activity.type === 'yellow' ? '#FFB74D' : '#8696A0' }} />
                <p className="text-sm" style={{ color: '#111B21' }}>{activity.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
