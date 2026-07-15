'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
} from 'lucide-react';

/* ─────────── STEP DATA ─────────── */
const steps = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Cadastre sua pousada',
    subtitle: '5 minutos é tudo que você precisa',
    desc: 'Informe nome, WhatsApp oficial, endereço e quantidade de quartos. O Zélla cria o perfil da sua pousada e já personaliza as respostas com suas regras, preços e políticas. Sem necessidade de técnico.',
    color: 'emerald',
    fields: ['Nome da pousada', 'WhatsApp oficial', 'Endereço completo', 'Qtd. de quartos', 'Chave PIX (opcional)', 'Regras da pousada'],
    highlights: ['Sem cartão de crédito', 'Onboarding guiado', 'Perfil instantâneo'],
  },
  {
    num: '02',
    icon: MessageSquare,
    title: 'A IA atende por você',
    subtitle: 'Seu WhatsApp vira ponto de venda 24/7',
    desc: 'A IA responde perguntas, mostra disponibilidade, negocia preços e envia a chave PIX cadastrada para pagamento — tudo automaticamente, no tom da sua pousada. O primeiro hóspede atendido pela IA costuma chegar em menos de 24 horas.',
    color: 'blue',
    highlights: ['Resposta em até 8 segundos', 'Tom personalizado', 'Chave PIX automática'],
  },
  {
    num: '03',
    icon: BarChart3,
    title: 'Acompanhe e otimize',
    subtitle: 'Dados que guiam suas decisões',
    desc: 'No painel de controle, veja em tempo real as reservas geradas, a receita do mês, a taxa de ocupação e sugestões inteligentes para vender mais. Relatórios semanais automáticos no seu e-mail.',
    color: 'violet',
    highlights: ['Dashboard em tempo real', 'Relatórios semanais', 'Sugestões de preço'],
  },
];

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
};

/* ─────────── STEP CARD ─────────── */
function StepCard({ step, index, isInView }: { step: typeof steps[number]; index: number; isInView: boolean }) {
  const c = colorMap[step.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative group"
    >
      {/* Desktop connector arrow */}
      {index < 2 && (
        <div className="hidden lg:flex absolute top-1/2 -right-5 z-20 items-center justify-center w-10 h-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.25 + 0.4 }}
            className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] group-hover:border-white/[0.15] transition-all duration-300"
          >
            <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white transition-colors duration-300" />
          </motion.div>
        </div>
      )}

      <div className={`relative p-7 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-500 h-full`}>
        {/* Hover glow */}
        <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full ${c.accent} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

        {/* Top row: number + icon */}
        <div className="flex items-start gap-4 mb-6">
          {/* Step number badge */}
          <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} ${c.border} border flex items-center justify-center shadow-lg ${c.glow}`}>
            <span className={`text-sm font-bold ${c.text}`}>{step.num}</span>
          </div>

          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <step.icon className={`w-6 h-6 ${c.text}`} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-lg sm:text-xl mb-1">{step.title}</h3>
        <p className={`text-xs font-medium ${c.text} mb-4 tracking-wide uppercase`}>{step.subtitle}</p>

        {/* Description */}
        <p className="text-neutral-400 text-sm leading-relaxed mb-6">{step.desc}</p>

        {/* Highlights chips */}
        <div className="flex flex-wrap gap-2 mb-6">
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
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: index * 0.25 + 0.6 + idx * 0.06 }}
                className="flex items-center gap-2.5"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${c.text.replace('text-', 'bg-')} opacity-60`} />
                <span className="text-neutral-400 text-[12px]">{field}</span>
              </motion.div>
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

/* ─────────── SECTION ─────────── */
export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="como-funciona" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background grid pattern (Cloudbeds-inspired) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-5">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Simples como 1-2-3</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
            Em 3 passos simples
          </h2>

          <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Do cadastro à primeira reserva via IA em menos de 24 horas. Sem precisar de técnico ou conhecimento técnico.
          </p>
        </motion.div>

        {/* ── Steps Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5">
          {steps.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} isInView={isInView} />
          ))}
        </div>

        {/* ── Bottom promise strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-500/[0.06] via-blue-500/[0.04] to-violet-500/[0.06] border border-white/[0.06] text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
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
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-400" />
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
          className="text-center mt-12"
        >
          <button
            onClick={() => {
              const el = document.querySelector('#precos');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer"
          >
            Começar agora — grátis por 7 dias
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}