'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Bed,
  DollarSign,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

export function DashboardPreview() {
  return (
    <section className="vzap-section-white vzap-section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm text-white font-semibold"
            style={{ backgroundColor: '#1c66de', fontFamily: "'Archivo', sans-serif" }}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Painel do Cliente</span>
          </div>
          <h2 className="vzap-heading">
            Veja tudo em tempo real
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#707070', fontSize: '18px', fontFamily: "'Archivo', sans-serif" }}>
            O dashboard ZEHLA mostra exatamente o que acontece na sua pousada — reservas, receita, ocupação e mensagens — tudo num clique.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="dashboard-preview max-w-4xl mx-auto"
        >
          {/* Browser topbar */}
          <div className="dashboard-topbar">
            <div className="dashboard-dot" style={{ backgroundColor: '#ff5f57' }} />
            <div className="dashboard-dot" style={{ backgroundColor: '#ffbd2e' }} />
            <div className="dashboard-dot" style={{ backgroundColor: '#28ca41' }} />
            <span className="ml-4 text-white/80 text-xs" style={{ fontFamily: "'Archivo', sans-serif" }}>
              app.zehla.com.br/dashboard
            </span>
          </div>

          {/* Dashboard body */}
          <div className="dashboard-body">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
                  Pousada do Sol
                </h3>
                <p className="text-xs" style={{ color: '#707070', fontFamily: "'Archivo', sans-serif" }}>
                  Última atualização: agora mesmo
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16c69a] animate-pulse" />
                <span className="text-xs text-[#16c69a] font-semibold" style={{ fontFamily: "'Archivo', sans-serif" }}>
                  Online
                </span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {/* RevPAR */}
              <div className="kpi-card">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" style={{ color: '#1c66de' }} />
                  <span className="text-xs font-medium" style={{ color: '#707070', fontFamily: "'Archivo', sans-serif" }}>
                    RevPAR
                  </span>
                </div>
                <div className="text-xl font-bold" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
                  R$ 187
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-[#16c69a]" />
                  <span className="text-xs text-[#16c69a] font-semibold" style={{ fontFamily: "'Archivo', sans-serif" }}>
                    +12%
                  </span>
                </div>
              </div>

              {/* Occupancy */}
              <div className="kpi-card">
                <div className="flex items-center gap-2 mb-2">
                  <Bed className="w-4 h-4" style={{ color: '#1c66de' }} />
                  <span className="text-xs font-medium" style={{ color: '#707070', fontFamily: "'Archivo', sans-serif" }}>
                    Ocupação
                  </span>
                </div>
                <div className="text-xl font-bold" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
                  78%
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-[#16c69a]" />
                  <span className="text-xs text-[#16c69a] font-semibold" style={{ fontFamily: "'Archivo', sans-serif" }}>
                    +3%
                  </span>
                </div>
              </div>

              {/* Revenue */}
              <div className="kpi-card">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4" style={{ color: '#1c66de' }} />
                  <span className="text-xs font-medium" style={{ color: '#707070', fontFamily: "'Archivo', sans-serif" }}>
                    Receita
                  </span>
                </div>
                <div className="text-xl font-bold" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
                  R$ 4.2k
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-[#16c69a]" />
                  <span className="text-xs text-[#16c69a] font-semibold" style={{ fontFamily: "'Archivo', sans-serif" }}>
                    +18%
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="kpi-card">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" style={{ color: '#1c66de' }} />
                  <span className="text-xs font-medium" style={{ color: '#707070', fontFamily: "'Archivo', sans-serif" }}>
                  WhatsApp
                  </span>
                </div>
                <div className="text-xl font-bold" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
                  247
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-[#16c69a]" />
                  <span className="text-xs text-[#16c69a] font-semibold" style={{ fontFamily: "'Archivo', sans-serif" }}>
                    +34%
                  </span>
                </div>
              </div>
            </div>

            {/* Mini chart area */}
            <div className="kpi-card mb-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
                  Receita — Últimos 7 dias
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-[#e8f1f8] text-[#1c66de] font-medium" style={{ fontFamily: "'Archivo', sans-serif" }}>
                    Esta semana
                  </span>
                </div>
              </div>
              {/* Simple bar chart */}
              <div className="flex items-end gap-2 h-32">
                {[45, 62, 38, 75, 55, 88, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t transition-all duration-500 hover:opacity-80"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i === 5 ? '#1c66de' : '#e8f1f8',
                        minHeight: '8px',
                      }}
                    />
                    <span className="text-[10px]" style={{ color: '#b7b7b7', fontFamily: "'Archivo', sans-serif" }}>
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="kpi-card">
              <h4 className="text-sm font-semibold mb-3" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
                Atividade Recente
              </h4>
              <div className="space-y-3">
                {[
                  { icon: Calendar, text: 'Nova reserva — Quarto 3 — Check-in 22/05', time: '2 min atrás', color: '#1c66de' },
                  { icon: MessageSquare, text: 'WhatsApp automático — Confirmação enviada', time: '5 min atrás', color: '#16c69a' },
                  { icon: DollarSign, text: 'PIX recebido — R$ 450,00 — Reserva #1847', time: '12 min atrás', color: '#1c66de' },
                  { icon: Users, text: 'Check-out — Quarto 7 — Hóspede satisfeito', time: '28 min atrás', color: '#707070' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
                        {item.text}
                      </p>
                    </div>
                    <span className="text-[10px] flex-shrink-0" style={{ color: '#b7b7b7', fontFamily: "'Archivo', sans-serif" }}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
