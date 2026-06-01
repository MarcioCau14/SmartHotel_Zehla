'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare,
  Terminal,
  BarChart3,
  CalendarCheck,
  Megaphone,
  CreditCard,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'WhatsApp Inteligente',
    description:
      'Atendimento automático 24/7. O hóspede pergunta sobre Wi-Fi, piscina, horários, reservas e o ZEHLA responde instantaneamente. Mensagens complexas vão para você.',
    color: 'orange',
  },

  {
    icon: Terminal,
    title: 'Terminal de Mensagens',
    description:
      'Todas as mensagens de hóspedes, colaboradores e fornecedores em um só lugar, coloridas e organizadas em tempo real. O cérebro ZEHLA processa tudo automaticamente.',
    color: 'cyan',
  },
  {
    icon: BarChart3,
    title: 'Financeiro na Tela',
    description:
      'Receita diária, ADR, RevPAR, ocupação. Gráficos bonitos que te mostram exatamente onde está seu dinheiro.',
    color: 'amber',
  },
  {
    icon: CalendarCheck,
    title: 'Gestão de Reservas',
    description:
      'Confirme, faça check-in ou cancele reservas com um clique. Sem erro, sem confusão.',
    color: 'rose',
  },

  {
    icon: Megaphone,
    title: 'Promoções Automáticas',
    description:
      'Crie promoções e o ZEHLA distribui automaticamente por WhatsApp, Instagram e canais de venda.',
    color: 'orange',
  },
  {
    icon: CreditCard,
    title: 'PIX & Pagamentos',
    description:
      'Receba PIX e cartão integrado. Split automático. Sem dor de cabeça com financeiro.',
    color: 'teal',
  },
];

const colorMap: Record<string, string> = {
  orange: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
  purple: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
  cyan: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
  amber: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
  rose: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
  violet: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
  teal: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
};

const borderMap: Record<string, string> = {
  orange: 'hover:border-[#FF5500]/25 hover:shadow-[0_12px_30px_rgba(255,85,0,0.08)]',
  purple: 'hover:border-[#FF5500]/25 hover:shadow-[0_12px_30px_rgba(255,85,0,0.08)]',
  cyan: 'hover:border-[#FF5500]/25 hover:shadow-[0_12px_30px_rgba(255,85,0,0.08)]',
  amber: 'hover:border-[#FF5500]/25 hover:shadow-[0_12px_30px_rgba(255,85,0,0.08)]',
  rose: 'hover:border-[#FF5500]/25 hover:shadow-[0_12px_30px_rgba(255,85,0,0.08)]',
  violet: 'hover:border-[#FF5500]/25 hover:shadow-[0_12px_30px_rgba(255,85,0,0.08)]',
  teal: 'hover:border-[#FF5500]/25 hover:shadow-[0_12px_30px_rgba(255,85,0,0.08)]',
};

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-32 px-6 sm:px-8 max-w-6xl mx-auto relative z-10 border-t border-white/5">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FF5500]/3 rounded-full blur-[140px] pointer-events-none -z-10" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight">
          Tudo que sua pousada precisa{' '}
          <span className="bg-gradient-to-r from-[#FF5500] to-[#ff7b2b] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,85,0,0.2)]">em um só lugar</span>
        </h2>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
          O cérebro ZEHLA resolve os maiores problemas da sua operação diária — automaticamente.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={`glass-strong border border-white/5 rounded-3xl p-7 transition-all duration-500 shadow-[0_10px_25px_rgba(0,0,0,0.4)] ${borderMap[feature.color]} group cursor-default`}
          >
            <div
              className={`inline-flex p-3 rounded-2xl border ${colorMap[feature.color]} mb-6 shadow-[0_0_12px_rgba(255,85,0,0.15)] group-hover:bg-[#FF5500]/25 group-hover:border-[#FF5500]/40 transition-all duration-300`}
            >
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-2 tracking-tight group-hover:text-[#FF5500] transition-colors duration-300">
              {feature.title}
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-medium">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
