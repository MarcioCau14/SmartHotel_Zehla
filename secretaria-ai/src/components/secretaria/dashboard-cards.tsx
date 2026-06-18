'use client';

import { motion } from 'framer-motion';
import { Users, ShieldCheck, Send } from 'lucide-react';

const CARD_V = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

function fmt(n: number): string {
  return n.toLocaleString('pt-BR');
}

interface Props {
  totalLeads: number;
  verifiedLeads: number;
  messagesSent: number;
}

export function DashboardCards({ totalLeads, verifiedLeads, messagesSent }: Props) {
  const cards = [
    { title: 'Total Leads', value: fmt(totalLeads), sub: 'Leads sincronizados', icon: Users, color: '#f1f5f9', glow: 'rgba(241,245,249,0.1)' },
    { title: 'Leads Verificados', value: fmt(verifiedLeads), sub: 'E-mails validados', icon: ShieldCheck, color: '#4169E1', glow: 'rgba(65,105,225,0.15)' },
    { title: 'Mensagens Enviadas', value: fmt(messagesSent), sub: 'E-mails + WhatsApp', icon: Send, color: '#14b8a6', glow: 'rgba(20,184,166,0.15)' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {cards.map((card, i) => (
        <motion.div key={card.title} custom={i} initial="hidden" animate="visible" variants={CARD_V}
          className="glass-card-hover p-5 lg:p-6 group relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `radial-gradient(ellipse at top left, ${card.glow}, transparent 70%)` }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>{card.title}</span>
              <div className="p-2 rounded-xl transition-all duration-300"
                style={{ backgroundColor: `${card.color}10`, border: `1px solid ${card.color}20` }}
              >
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-3xl lg:text-4xl font-bold tracking-tight mb-1" style={{ color: card.color }}>
              {card.value}
            </div>
            <span className="text-xs" style={{ color: '#64748b' }}>{card.sub}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
