'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, Check, ArrowRight, Zap, Clock, Shield } from 'lucide-react';

interface Platform {
  name: string;
  category: string;
  icon: string;
  color: string;
  badge?: string;
  badgeColor?: string;
}

const platforms: Platform[] = [
  {
    name: 'Booking.com',
    category: 'Reservas',
    icon: '🏨',
    color: 'from-blue-500 to-blue-600',
    badge: 'iCal Ativo',
    badgeColor: 'from-emerald-500 to-emerald-600',
  },
  {
    name: 'Airbnb',
    category: 'Reservas',
    icon: '🏠',
    color: 'from-rose-500 to-rose-600',
    badge: 'iCal Ativo',
    badgeColor: 'from-emerald-500 to-emerald-600',
  },
  {
    name: 'Expedia',
    category: 'Reservas',
    icon: '✈️',
    color: 'from-yellow-500 to-yellow-600',
    badge: 'iCal Ativo',
    badgeColor: 'from-emerald-500 to-emerald-600',
  },
  {
    name: 'Decolar',
    category: 'Reservas',
    icon: '🌎',
    color: 'from-orange-500 to-orange-600',
    badge: 'API Futura',
    badgeColor: 'from-zinc-500 to-zinc-600',
  },
  {
    name: 'Trivago',
    category: 'Metasearch',
    icon: '🔍',
    color: 'from-green-500 to-green-600',
    badge: 'API Futura',
    badgeColor: 'from-zinc-500 to-zinc-600',
  },
  {
    name: 'Google Hotels',
    category: 'Metasearch',
    icon: '🔍',
    color: 'from-blue-400 to-blue-500',
    badge: 'API Futura',
    badgeColor: 'from-zinc-500 to-zinc-600',
  },
  {
    name: 'TripAdvisor',
    category: 'Metasearch',
    icon: '⭐',
    color: 'from-emerald-500 to-emerald-600',
    badge: 'API Futura',
    badgeColor: 'from-zinc-500 to-zinc-600',
  },
  {
    name: 'Mercado Pago',
    category: 'Pagamentos',
    icon: '💳',
    color: 'from-blue-500 to-indigo-600',
    badge: 'Gateway Oficial',
    badgeColor: 'from-emerald-500 to-emerald-600',
  },
];

export function IntegrationsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Integrações Nativas</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">
            Integrado com as maiores
            <br />
            <span className="gradient-text">plataformas de hospedagem do Brasil</span>
          </h2>

          <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-8">
            Conecte sua pousada às principais plataformas de reservas e pagamentos em um único painel.
            Sincronização periódica de disponibilidade via iCal (intervalo ~15 min).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-neutral-500">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Sincronização periódica</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Atualização automática (~15 min)</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Redução de conflitos</span>
            </div>
          </div>
        </motion.div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative"
            >
              <div className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300">
                {/* Badge */}
                {platform.badge && (
                  <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${platform.badgeColor ?? 'from-zinc-500 to-zinc-600'} text-white text-[10px] font-bold shadow-lg`}>
                    {platform.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="text-2xl">{platform.icon}</span>
                </div>

                {/* Name */}
                <h3 className="text-white font-bold text-lg mb-1">{platform.name}</h3>
                <p className="text-neutral-500 text-xs mb-4">{platform.category}</p>

                {/* Status */}
                {platform.badge === 'iCal Ativo' || platform.badge === 'Gateway Oficial' ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <Zap className="w-3 h-3" />
                    <span className="font-medium">Conectado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-neutral-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">Previsto</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Sincronização Periódica',
              desc: 'Quando uma reserva é feita em qualquer plataforma conectada via iCal, o ZÉLLA atualiza a disponibilidade automaticamente. Redução significativa de conflitos de datas.',
              icon: '🔄',
            },
            {
              title: 'Preços Unificados',
              desc: 'Defina seus preços no ZÉLLA e exporte para as plataformas. Ajustes manuais baseados em demanda podem ser aplicados quando necessário.',
              icon: '💰',
            },
            {
              title: 'Analytics Centralizado',
              desc: 'Veja todas as métricas de todas as plataformas em um único dashboard. Receita, ocupação, reviews e muito mais consolidados.',
              icon: '📊',
            },
          ].map((benefit, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">{benefit.icon}</span>
              </div>
              <h4 className="text-white font-bold text-lg mb-2">{benefit.title}</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => {
              const el = document.querySelector('#como-funciona');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all duration-300 shadow-xl shadow-emerald-500/30 cursor-pointer"
          >
            Ver como funciona
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}