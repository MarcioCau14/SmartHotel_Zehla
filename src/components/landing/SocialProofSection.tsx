'use client';

import { useRef } from 'react';
import { motion, useInView, useSpring, useMotionValue, useTransform } from 'framer-motion';
import {
  Hotel,
  MessageSquare,
  TrendingUp,
  Clock,
  Users,
  Star,
} from 'lucide-react';

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 2000, bounce: 0 });
  const display = useTransform(spring, (current) =>
    `${prefix}${Math.round(current).toLocaleString('pt-BR')}${suffix}`
  );

  if (isInView) {
    motionValue.set(target);
  }

  return <motion.span ref={ref}>{display}</motion.span>;
}

const stats = [
  {
    icon: Hotel,
    value: 100,
    suffix: '+',
    label: 'Pousadas Atendidas',
    description: 'Em todo o litoral brasileiro, de Florianópolis a Ubatuba',
    color: 'from-emerald-500/20 to-emerald-900/10',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
  },
  {
    icon: MessageSquare,
    value: 50000,
    suffix: '+',
    label: 'Mensagens por Mês',
    description: 'Respondidas automaticamente com IA no WhatsApp',
    color: 'from-blue-500/20 to-blue-900/10',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: TrendingUp,
    value: 35,
    suffix: '%',
    label: 'Aumento em Reservas',
    description: 'Média das pousadas parceiras nos primeiros 90 dias',
    color: 'from-amber-500/20 to-amber-900/10',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
  },
  {
    icon: Clock,
    value: 8,
    suffix: 's',
    label: 'Tempo Médio de Resposta',
    description: 'Contra 4+ horas do atendimento manual nos fins de semana',
    color: 'from-purple-500/20 to-purple-900/10',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: Users,
    value: 15000,
    suffix: '+',
    label: 'Hóspedes Atendidos',
    description: 'Pelo Zélla nos últimos 12 meses',
    color: 'from-teal-500/20 to-teal-900/10',
    iconColor: 'text-teal-400',
    borderColor: 'border-teal-500/20',
  },
  {
    icon: Star,
    value: 98,
    suffix: '%',
    label: 'Satisfação dos Hóspedes',
    description: 'Avaliação média do atendimento via IA',
    color: 'from-rose-500/20 to-rose-900/10',
    iconColor: 'text-rose-400',
    borderColor: 'border-rose-500/20',
  },
];

export function SocialProofSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 bg-[#0a0a0a] overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 text-xs font-medium uppercase tracking-wider">Números Reais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Confiança que se {' '}
            <span className="text-emerald-400 font-bold">mede em resultados</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Pousadas de todo o Brasil já transformaram seu atendimento com o Zélla. Veja o impacto real nos números.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative rounded-2xl p-6 bg-white/[0.02] border ${stat.borderColor} hover:bg-white/[0.04] transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white font-semibold text-sm mb-2">{stat.label}</div>
                <div className="text-neutral-500 text-xs leading-relaxed">{stat.description}</div>
              </motion.div>
            );
          })}
        </div>


      </div>
    </section>
  );
}