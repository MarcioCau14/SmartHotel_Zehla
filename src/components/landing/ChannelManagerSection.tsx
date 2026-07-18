'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Hotel,
  Calendar,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  Rocket,
  Lock,
} from 'lucide-react';
import { useNiche } from '@/contexts/NicheContext';

/* ─────────── ROADMAP DATA ─────────── */
function getRoadmapPhases(niche: 'pousadas' | 'anfitrioes' | 'parceiro') {
  const isPousadas = niche === 'pousadas';
  const isAnfitrioes = niche === 'anfitrioes';
  return [
    {
      phase: 'Fase 1',
      status: 'available' as const,
      title: 'iCal Export & Import',
      desc: isPousadas
        ? 'Exporte seu calendário de disponibilidade para Booking.com, Decolar e qualquer OTA que aceite iCal. Importe reservas externas automaticamente. Já disponível hoje.'
        : isAnfitrioes
        ? 'Exporte seu calendário de disponibilidade para Airbnb, Booking.com e qualquer plataforma que aceite iCal. Importe reservas externas automaticamente. Já disponível hoje.'
        : 'Exporte seu calendário para qualquer plataforma que aceite iCal. Importe reservas externas automaticamente. Já disponível hoje.',
      features: [
        isPousadas ? 'Feed iCal por quarto' : 'Feed iCal por propriedade',
        'Importação de reservas via URL iCal',
        'Atualização automática a cada 15 minutos',
      ],
    },
    {
      phase: 'Fase 2',
      status: 'building' as const,
      title: 'Channel Manager Direto',
      desc: 'Conexão via API com os principais canais de reserva do mercado brasileiro. Sincronização bidirecional de disponibilidade e preços em tempo real — sem webhooks com delay.',
      features: [
        isPousadas ? 'API Booking.com & Decolar' : isAnfitrioes ? 'API Booking.com & Airbnb' : 'API dos principais canais',
        'Sincronização bidirecional em tempo real',
        'Prevenção automática de overbooking',
        'Painel unificado de reservas',
      ],
    },
    {
      phase: 'Fase 3',
      status: 'planned' as const,
      title: 'Expansão 300+ Canais',
      desc: 'Integração com dezenas de OTAs nacionais e internacionais via parceiros como SiteMinder. Um único painel para gerenciar toda a distribuição do seu negócio.',
      features: [
        'Expedia, Decolar, Trivago, Stays.net',
        'Google Hotels & Google Travel',
        'Preços dinâmicos inteligentes',
        'Relatório de performance por canal',
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
  const { isPousadas, isAnfitrioes, isParceiro } = useNiche();
  const niche: 'pousadas' | 'anfitrioes' | 'parceiro' = isPousadas ? 'pousadas' : isAnfitrioes ? 'anfitrioes' : 'parceiro';
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
            <Hotel className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Channel Manager</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Seus canais, centralized
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">sem overbooking</span>
          </h2>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            O Channel Manager do Zélla está sendo construído em fases. Comece hoje com exportação iCal e acompanhe a evolução rumo à sincronização bidirecional com 300+ canais — para {isPousadas ? 'sua pousada' : isAnfitrioes ? 'seus imóveis' : 'seu negócio'}.
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
                      <span className="text-amber-400/70 text-xs font-medium">Em desenvolvimento ativo — previsão de lançamento em breve</span>
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
                <div className="text-white font-bold text-sm">Sem promessas falsas</div>
                <div className="text-neutral-500 text-xs">Mostramos exatamente o que está disponível hoje</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/[0.08]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Evolução contínua</div>
                <div className="text-neutral-500 text-xs">Novos canais e funcionalidades a cada atualização</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/[0.08]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">iCal já funciona</div>
                <div className="text-neutral-500 text-xs">Exporte e importe calendários hoje mesmo</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}