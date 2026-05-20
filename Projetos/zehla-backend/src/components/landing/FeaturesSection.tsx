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
  orange: 'text-[#FF5500] bg-[#FF5500]/10',
  purple: 'text-[#FF5500] bg-[#FF5500]/10',
  cyan: 'text-[#FF5500] bg-[#FF5500]/10',
  amber: 'text-[#FF5500] bg-[#FF5500]/10',
  rose: 'text-rose-400 bg-rose-500/10',
  violet: 'text-violet-400 bg-violet-500/10',
  teal: 'text-teal-400 bg-teal-500/10',
};

const borderMap: Record<string, string> = {
  orange: 'hover:border-[#FF5500]/30',
  purple: 'hover:border-[#FF5500]/30',
  cyan: 'hover:border-cyan-500/30',
  amber: 'hover:border-[#FF5500]/30',
  rose: 'hover:border-rose-500/30',
  violet: 'hover:border-violet-500/30',
  teal: 'hover:border-teal-500/30',
};

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
          Tudo que sua pousada precisa{' '}
          <span className="gradient-text">em um só lugar</span>
        </h2>
        <p className="text-[#898989] text-lg max-w-2xl mx-auto">
          O cérebro ZEHLA resolve os maiores problemas da sua operação diária — automaticamente.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={`glass-card p-6 transition-all duration-300 ${borderMap[feature.color]} group cursor-default`}
          >
            <div
              className={`inline-flex p-3 rounded-xl ${colorMap[feature.color]} mb-4`}
            >
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-[#898989] leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
