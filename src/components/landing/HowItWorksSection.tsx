'use client';

import { useRef } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  UserPlus,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Mail,
  Building,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  Link,
  Bot,
  CreditCard,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useNiche } from '@/contexts/NicheContext';
import { getNicheContent, type StepData } from '@/data/niche-content';

/* ─────────── ICON LOOKUP MAP ─────────── */
const iconMap: Record<string, LucideIcon> = {
  UserPlus,
  MessageSquare,
  BarChart3,
  Link,
  Bot,
  CreditCard,
  TrendingUp,
};

/* ─────────── COLOR MAP ─────────── */
const colorMap: Record<string, { bg: string; border: string; text: string; glow: string; accent: string; ring: string }> = {
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-900/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
    accent: 'bg-emerald-500/10',
    ring: 'border-emerald-500/20',
  },
  blue: {
    bg: 'from-sky-500/20 to-sky-900/10',
    border: 'border-sky-500/20',
    text: 'text-sky-400',
    glow: 'shadow-sky-500/10',
    accent: 'bg-sky-500/10',
    ring: 'border-sky-500/20',
  },
  violet: {
    bg: 'from-violet-500/20 to-violet-900/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/10',
    accent: 'bg-violet-500/10',
    ring: 'border-violet-500/20',
  },
  amber: {
    bg: 'from-amber-500/20 to-amber-900/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/10',
    accent: 'bg-amber-500/10',
    ring: 'border-amber-500/20',
  },
  sky: {
    bg: 'from-sky-500/20 to-sky-900/10',
    border: 'border-sky-500/20',
    text: 'text-sky-400',
    glow: 'shadow-sky-500/10',
    accent: 'bg-sky-500/10',
    ring: 'border-sky-500/20',
  },
};

/* ─────────── SCROLL-LINKED STEP CARD ─────────── */
function ParallaxStepCard({
  step,
  index,
  scrollYProgress,
  reducedMotion,
}: {
  step: StepData;
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  reducedMotion: boolean;
}) {
  const c = colorMap[step.color];
  const IconComponent = iconMap[step.icon];

  // Each step appears at a different scroll progress point
  // Step 1: 0.05-0.25, Step 2: 0.3-0.5, Step 3: 0.55-0.75
  const rangeStart = 0.05 + index * 0.28;
  const rangeMid = rangeStart + 0.15;
  const rangeEnd = rangeMid + 0.1;

  const opacity = useTransform(scrollYProgress, [rangeStart, rangeMid, rangeEnd], reducedMotion ? [1, 1, 1] : [0, 1, 1]);
  const y = useTransform(
    scrollYProgress,
    [rangeStart, rangeMid],
    reducedMotion ? [0, 0] : [80, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [rangeStart, rangeMid],
    reducedMotion ? [1, 1] : [0.92, 1]
  );

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="relative group"
    >
      {/* Desktop connector arrow */}
      {index < 2 && (
        <div className="hidden lg:flex absolute top-1/2 -right-5 z-20 items-center justify-center w-10 h-10">
          <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] group-hover:border-white/[0.15] transition-all duration-300">
            <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      )}

      <div className={`relative p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-500 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black`}>
        {/* Hover glow */}
        <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full ${c.accent} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

        {/* Top row: number + icon */}
        <div className="flex items-start gap-4 mb-7">
          {/* Step number badge */}
          <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} ${c.border} border flex items-center justify-center shadow-lg ${c.glow}`}>
            <span className={`text-sm font-bold ${c.text}`}>{step.num}</span>
          </div>

          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            {IconComponent && <IconComponent className={`w-6 h-6 ${c.text}`} />}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-lg sm:text-xl mb-2">{step.title}</h3>
        <p className={`text-xs font-medium ${c.text} mb-5 tracking-wide uppercase`}>{step.subtitle}</p>

        {/* Description */}
        <p className="text-neutral-400 text-sm leading-relaxed mb-7">{step.desc}</p>

        {/* Highlights chips */}
        <div className="flex flex-wrap gap-2 mb-7">
          {step.highlights.map((h, i) => (
            <div
              key={i}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${c.accent} border ${c.ring} text-[11px] font-medium ${c.text}`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {h}
            </div>
          ))}
        </div>

        {/* Form fields preview (step 1 only) */}
        {step.fields && (
          <div className="space-y-2.5 pt-5 border-t border-white/[0.04]">
            {step.fields.map((field, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${c.text.replace('text-', 'bg-')} opacity-60`} />
                <span className="text-neutral-400 text-[12px]">{field}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3 text-emerald-400/70 text-[11px]">
              <Mail className="w-3 h-3" />
              <Building className="w-3 h-3" />
              <span>Cadastro simples — sem complicações</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────── SECTION — with Sticky Scroll Parallax ─────────── */
export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const { niche, isPousada, isAirbnb } = useNiche();
  const content = getNicheContent(niche);
  const prefersReducedMotion = useReducedMotion();

  // Scroll-linked progress for the entire section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Title stays fixed while steps animate in
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 0.95], prefersReducedMotion ? [1, 1, 1, 1] : [1, 1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.1, 0.8, 0.95], prefersReducedMotion ? [0, 0, 0, 0] : [0, 0, -20, -60]);

  // Niche-aware header text
  const headerTitle = isPousada
    ? 'Em 3 passos simples'
    : 'Em 3 passos, sem sair do sofá';

  const headerDesc = isPousada
    ? 'Do cadastro à primeira reserva via IA em menos de 24 horas. Sem precisar de técnico ou conhecimento técnico.'
    : 'Da URL do anúncio ao primeiro check-in virtual automaticamente. Sem precisar de técnico ou conhecimento técnico.';

  return (
    <section ref={sectionRef} id="como-funciona" className="relative overflow-hidden" style={{ minHeight: '180vh' }}>
      {/* Background grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── Sticky container ── */}
      <div className="sticky top-0 h-screen overflow-y-auto flex items-center">
        <div className="relative w-full py-20 sm:py-28">
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            {/* ── Header (fixed via transform) ── */}
            <motion.div
              style={{ opacity: titleOpacity, y: titleY }}
              className="text-center mb-16"
            >
              {/* Eyebrow */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isAirbnb ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'} mb-6`}>
                <Zap className={`w-3.5 h-3.5 ${isAirbnb ? 'text-blue-400' : 'text-emerald-400'}`} />
                <span className={`${isAirbnb ? 'text-blue-400' : 'text-emerald-400'} text-xs font-semibold uppercase tracking-wider`}>Simples como 1-2-3</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.h2
                  key={`title-${niche}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
                >
                  {headerTitle}
                </motion.h2>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.p
                  key={`desc-${niche}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
                  className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
                >
                  {headerDesc}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* ── Steps Grid — scroll-linked ── */}
            <AnimatePresence mode="wait">
              <div
                key={`steps-${niche}`}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {content.steps.map((step, i) => (
                  <ParallaxStepCard
                    key={`${niche}-${step.num}`}
                    step={step}
                    index={i}
                    scrollYProgress={scrollYProgress}
                    reducedMotion={prefersReducedMotion}
                  />
                ))}
              </div>
            </AnimatePresence>

            {/* ── Bottom promise strip ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.0 }}
              className={`mt-20 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-emerald-500/[0.06] via-blue-500/[0.04] to-violet-500/[0.06] border border-white/[0.06] text-center`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center`}>
                    <Sparkles className={`w-5 h-5 text-emerald-400`} />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">Primeira reserva IA</div>
                    <div className="text-neutral-500 text-xs">Em até 24 horas</div>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-10 bg-white/[0.08]" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">
                      <span className="text-emerald-400">PT</span>
                      <span className="text-neutral-600 mx-1.5">/</span>
                      <span className="text-blue-400">ES</span>
                      <span className="text-white ml-1.5">Bilíngue</span>
                    </div>
                    <div className="text-neutral-500 text-xs">Atende em português e espanhol</div>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-10 bg-white/[0.08]" />
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center`}>
                    <Zap className={`w-5 h-5 text-violet-400`} />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">7 dias grátis</div>
                    <div className="text-neutral-500 text-xs">Sem cartão de crédito</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── CTA ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 1.2 }}
              className="text-center mt-14"
            >
              <button
                onClick={() => {
                  const el = document.querySelector('#precos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group inline-flex items-center gap-2 px-8 py-4 rounded-xl ${isAirbnb ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/25 hover:shadow-blue-500/40' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/25 hover:shadow-emerald-500/40'} text-white font-bold transition-all duration-300 shadow-lg cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
              >
                Começar agora - grátis por 7 dias
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
