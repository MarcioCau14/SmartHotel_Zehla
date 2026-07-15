'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Clock,
  MessageSquare,
  DollarSign,
  BarChart3,
  Users,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

/* ─────────── DATA ─────────── */
const mainCards = [
  {
    icon: Clock,
    title: 'Nunca mais perca uma reserva',
    desc: 'Enquanto você descansa, a IA do Zélla atende cada hóspede em até 8 segundos — respondendo sobre disponibilidade, preços e enviando sua chave PIX cadastrada. Madrugada, feriado, domingo de chuva: sempre online.',
    stat: { val: '24/7', label: 'Atendimento ininterrupto' },
    color: 'emerald',
    size: 'lg', // bento: large card
  },
  {
    icon: MessageSquare,
    title: 'Uma mensagem, tudo resolvido',
    desc: 'Em vez de 5 balões fragmentados, o Zélla reúne saudação, disponibilidade, preço e chave PIX em um único balão completo. Mais profissional para o hóspede, mais eficiente para seu custo de API.',
    stat: { val: '1', label: 'Balão com tudo incluído' },
    color: 'blue',
    size: 'lg',
  },
  {
    icon: Users,
    title: 'Contexto inteligente',
    desc: 'O hóspede manda "Tem vaga?", "Preço?" e "Aceita pet?" em sequência? O Zélla agrupa tudo e responde de uma vez, entendendo a intenção completa da conversa.',
    color: 'sky',
    size: 'sm',
  },
  {
    icon: BarChart3,
    title: 'Painel de controle em tempo real',
    desc: 'Reservas geradas, receita do dia, taxa de ocupação — tudo num dashboard que se atualiza ao vivo. Relatórios semanais automáticos por e-mail para decisões sem achismo.',
    color: 'amber',
    size: 'sm',
  },
  {
    icon: DollarSign,
    title: 'Custo sob controle',
    desc: 'Você define o orçamento mensal e o Zélla gerencia o uso da API automaticamente. Sem surpresas na fatura, sem estresse.',
    color: 'violet',
    size: 'sm',
  },
  {
    icon: ShieldCheck,
    title: 'Pronto para outubro 2026',
    desc: 'A Meta está mudando as regras da API do WhatsApp. O Zélla já está adaptado para manter seus custos baixos e sua operação estável.',
    color: 'pink',
    size: 'sm',
  },
];

const colorMap: Record<string, { bg: string; accent: string; ring: string; glow: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500', accent: 'bg-emerald-500/10', ring: 'border-emerald-500/20', glow: 'shadow-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  blue:    { bg: 'bg-blue-500', accent: 'bg-blue-500/10', ring: 'border-blue-500/20', glow: 'shadow-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  sky:     { bg: 'bg-sky-500', accent: 'bg-sky-500/10', ring: 'border-sky-500/20', glow: 'shadow-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' },
  amber:   { bg: 'bg-amber-500', accent: 'bg-amber-500/10', ring: 'border-amber-500/20', glow: 'shadow-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  violet:  { bg: 'bg-violet-500', accent: 'bg-violet-500/10', ring: 'border-violet-500/20', glow: 'shadow-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
  pink:    { bg: 'bg-pink-500', accent: 'bg-pink-500/10', ring: 'border-pink-500/20', glow: 'shadow-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
};

/* ─────────── SCROLLING STATS MARQUEE (Cloudbeds-inspired) ─────────── */
const scrollStats = [
  { val: '+35%', label: 'Aumento em reservas diretas' },
  { val: '8s', label: 'Tempo médio de resposta' },
  { val: '64%', label: 'Redução em mensagens da API' },
  { val: '24/7', label: 'Disponibilidade da IA' },
  { val: '5 min', label: 'Tempo de setup' },
  { val: 'R$ 197', label: 'A partir de /mês' },
];

function StatsMarquee() {
  return (
    <div className="relative overflow-hidden py-6 mb-4">
      {/* Edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#060608] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#060608] to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee hover:[animation-play-state:paused] w-max gap-4">
        {[...scrollStats, ...scrollStats].map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] shrink-0"
          >
            <span className="text-2xl font-light text-white tracking-tight">{s.val}</span>
            <span className="text-xs text-neutral-500 font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      ` }} />
    </div>
  );
}

/* ─────────── SINGLE OPPORTUNITY CARD ─────────── */
function OpportunityCard({ item, index, isInView }: { item: typeof mainCards[number]; index: number; isInView: boolean }) {
  const c = colorMap[item.color];
  const isLarge = item.size === 'lg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group relative p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500 cursor-default overflow-hidden ${
        isLarge ? 'lg:col-span-1' : ''
      }`}
    >
      {/* Hover glow effect */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full ${c.accent} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl ${c.accent} border ${c.ring} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <item.icon className="w-5 h-5 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-base sm:text-lg mb-3 group-hover:${c.text} transition-colors duration-300">
        {item.title}
      </h3>

      {/* Description */}
      <p className="text-neutral-400 text-sm leading-relaxed mb-4">
        {item.desc}
      </p>

      {/* Stat badge (only large cards) */}
      {item.stat && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${c.accent} border ${c.ring}`}>
          <TrendingUp className={`w-4 h-4 ${c.text}`} />
          <span className={`text-lg font-bold ${c.text}`}>{item.stat.val}</span>
          <span className="text-[11px] text-neutral-500 font-medium">{item.stat.label}</span>
        </div>
      )}

      {/* Arrow hint on hover (large cards) */}
      {isLarge && (
        <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors duration-300" />
        </div>
      )}
    </motion.div>
  );
}

/* ─────────── MAIN SECTION ─────────── */
export function PainPointsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  // Parallax subtle effect for the section background
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative py-20 sm:py-28 bg-[#060608] overflow-hidden">
      {/* Subtle parallax background orbs */}
      <motion.div
        style={{ y: bgY }}
        className="absolute top-20 -left-40 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[120px] pointer-events-none"
      />
      <motion.div
        style={{ y: bgY }}
        className="absolute bottom-20 -right-40 w-[350px] h-[350px] rounded-full bg-blue-500/[0.03] blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── Header with editorial slash ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12"
        >
          {/* Eyebrow with slash */}
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="text-neutral-600 text-sm font-medium">/</span>
            <span className="text-emerald-400/80 text-xs font-semibold uppercase tracking-widest">
              Por que o Zélla
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
            Sua pousada merece
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"> um atendimento à altura</span>
          </h2>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Veja como o Zélla transforma o WhatsApp da sua pousada em uma máquina de reservas — sem complicação e no seu tom de voz.
          </p>
        </motion.div>

        {/* ── Stats Marquee ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <StatsMarquee />
        </motion.div>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {mainCards.map((item, i) => (
            <OpportunityCard key={item.title} item={item} index={i} isInView={isInView} />
          ))}
        </div>

        {/* ── Bottom trust strip (Cloudbeds-inspired) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-14 pt-8 border-t border-white/[0.04]"
        >
          {[
            { icon: Zap, text: 'Setup em 5 minutos' },
            { icon: ShieldCheck, text: 'Sem cartão de crédito' },
            { icon: Sparkles, text: 'IA treinada para pousadas' },
            { icon: TrendingUp, text: 'Resultados em 48h' },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-neutral-500 text-sm">
              <t.icon className="w-4 h-4 text-emerald-500/50" />
              <span>{t.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}