'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Rocket,
  Lock,
  Calendar,
  Shield,
  Zap,
} from 'lucide-react';
import { useNiche } from '@/contexts/NicheContext';

/* ─────────── ROADMAP DATA ─────────── */
function getRoadmapPhases(niche: 'pousada' | 'airbnb') {
  const isPousada = niche === 'pousada';
  const isAirbnb = niche === 'airbnb';
  return [
    {
      phase: 'Fase 1',
      status: 'available' as const,
      title: 'iCal Export & Import',
      desc: isPousada
        ? 'Exporte seu calendário de disponibilidade para Booking.com, Decolar e qualquer OTA que aceite iCal. Importe reservas externas automaticamente. Já disponível hoje.'
        : isAirbnb
        ? 'Exporte seu calendário de disponibilidade para Airbnb, Booking.com e qualquer plataforma que aceite iCal. Importe reservas externas automaticamente. Já disponível hoje.'
        : 'Exporte seu calendário para qualquer plataforma que aceite iCal. Importe reservas externas automaticamente. Já disponível hoje.',
      features: [
        isPousada ? 'Feed iCal por quarto' : 'Feed iCal por propriedade',
        'Importação de reservas via URL iCal',
        'Atualização automática a cada 15 minutos',
      ],
    },
    {
      phase: 'Fase 2',
      status: 'building' as const,
      title: 'Conexão Direta com Canais',
      desc: 'Estamos trabalhando na conexão via API com os principais canais de reserva do mercado brasileiro. Em desenvolvimento — vamos liberar conforme cada integração for testada e validada.',
      features: [
        isPousada ? 'API Booking.com & Decolar' : isAirbnb ? 'API Booking.com & Airbnb' : 'API dos principais canais',
        'Sincronização de disponibilidade e preços',
        'Painel unificado de reservas',
      ],
    },
    {
      phase: 'Fase 3',
      status: 'planned' as const,
      title: 'Expansão de Canais',
      desc: 'Mais canais e OTAs nacionais e internacionais estão no nosso roadmap. Vamos liberar gradativamente, sempre com testes rigorosos antes de disponibilizar. Qualidade antes de quantidade.',
      features: [
        'Novos canais conforme demanda',
        'Relatório de performance por canal',
        'Atualizações progressivas',
      ],
    },
  ];
}

const statusConfig = {
  available: {
    badge: 'Disponível',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    glowClass: 'from-emerald-500/10 to-emerald-900/5',
    borderClass: 'border-emerald-500/15',
  },
  building: {
    badge: 'Em desenvolvimento',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    icon: Rocket,
    iconClass: 'text-amber-400',
    glowClass: 'from-amber-500/10 to-amber-900/5',
    borderClass: 'border-amber-500/15',
  },
  planned: {
    badge: 'No roadmap',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    icon: Lock,
    iconClass: 'text-blue-400',
    glowClass: 'from-blue-500/10 to-blue-900/5',
    borderClass: 'border-blue-500/15',
  },
};

export function ChannelManagerSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { isPousada, isAirbnb } = useNiche();
  const niche: 'pousada' | 'airbnb' = isPousada ? 'pousada' : 'airbnb';
  const roadmapPhases = getRoadmapPhases(niche);

  return (
    <section ref={ref} id="channel-manager" className="relative py-28 sm:py-36 lg:py-44 bg-[#060608] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Calendário & Canais</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Seu calendário,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">siempre atualizado</span>
          </h2>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Comece hoje com exportação iCal para sincronizar disponibilidade com {isPousada ? 'Booking.com, Decolar e outras OTAs' : isAirbnb ? 'Airbnb, Booking.com e outras plataformas' : 'suas plataformas de reserva'}. Estamos evoluindo o Channel Manager com responsabilidade — cada nova integração só chega quando está realmente pronta e testada.
          </p>
        </motion.div>

        {/* ── Roadmap Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roadmapPhases.map((phase, i) => {
            const cfg = statusConfig[phase.status];
            const StatusIcon = cfg.icon;

            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`relative p-8 sm:p-10 rounded-2xl bg-white/[0.02] border ${cfg.borderClass} hover:bg-white/[0.03] transition-all duration-500 group`}
              >
                {/* Hover glow */}
                <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br ${cfg.glowClass} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                {/* Phase label + status badge */}
                <div className="flex items-center justify-between mb-7">
                  <span className="text-neutral-600 text-xs font-bold uppercase tracking-widest">{phase.phase}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.badgeClass}`}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-lg sm:text-xl mb-4">{phase.title}</h3>

                {/* Description */}
                <p className="text-neutral-400 text-sm leading-relaxed mb-7">{phase.desc}</p>

                {/* Features */}
                <div className="space-y-4">
                  {phase.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${phase.status === 'available' ? 'text-emerald-400' : phase.status === 'building' ? 'text-amber-400/60' : 'text-blue-400/40'}`} />
                      <span className={`text-sm ${phase.status === 'available' ? 'text-neutral-300' : 'text-neutral-500'}`}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA for available phase */}
                {phase.status === 'available' && (
                  <div className="mt-8 pt-6 border-t border-white/[0.04]">
                    <button
                      onClick={() => {
                        const el = document.querySelector('#precos');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group/btn inline-flex items-center gap-2 text-emerald-400 text-sm font-semibold hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      Ativar iCal agora
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Building indicator */}
                {phase.status === 'building' && (
                  <div className="mt-8 pt-6 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-amber-400/70 text-xs font-medium">Em desenvolvimento — liberaremos quando estiver validado e testado</span>
                    </div>
                  </div>
                )}

                {/* Planned indicator */}
                {phase.status === 'planned' && (
                  <div className="mt-8 pt-6 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-blue-400/50" />
                      <span className="text-blue-400/50 text-xs font-medium">No roadmap — prioridade após validação da Fase 2</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom trust strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-blue-500/[0.05] via-white/[0.02] to-emerald-500/[0.05] border border-white/[0.06]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Sem promessas vazias</div>
                <div className="text-neutral-500 text-xs">Só mostramos o que está disponível ou em desenvolvimento real</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/[0.08]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">iCal já funciona</div>
                <div className="text-neutral-500 text-xs">Exporte e importe calendários hoje mesmo</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/[0.08]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Evolução responsável</div>
                <div className="text-neutral-500 text-xs">Cada integração é liberada só após testes rigorosos</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
