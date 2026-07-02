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
} from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Cadastre sua pousada em 5 minutos',
    desc: 'Informe nome, e-mail, CNPJ (opcional), WhatsApp, endereço e quantidade de quartos. Pronto — o ZÉLLA já começa a montar seu perfil inteligente e calibrar a IA com o tom da sua marca. Sem técnico, sem configuração complexa.',
    color: 'emerald',
    fields: ['Nome da pousada', 'E-mail principal', 'CNPJ (opcional)', 'WhatsApp oficial', 'Endereço completo', 'Quantidade de quartos'],
  },
  {
    num: '02',
    icon: MessageSquare,
    title: 'A IA começa a atender por você',
    desc: 'Seu WhatsApp oficial vira um ponto de venda 24/7. A IA responde perguntas, mostra disponibilidade, negocia preços e gera PIX para pagamento — tudo automaticamente, no tom da sua pousada.',
    color: 'blue',
  },
  {
    num: '03',
    icon: BarChart3,
    title: 'Acompanhe e otimize seus resultados',
    desc: 'No dashboard, veja em tempo real quantas reservas a IA gerou, receita do mês, taxa de ocupação e sugestões do Cérebro ZÉLLA. Quanto mais usa, mais inteligente o sistema fica.',
    color: 'royal',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-900/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
  },
  blue: {
    bg: 'from-sky-500/20 to-sky-900/10',
    border: 'border-sky-500/20',
    text: 'text-sky-400',
    glow: 'shadow-sky-500/10',
  },
  royal: {
    bg: 'from-blue-500/20 to-blue-900/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/10',
  },
};

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="como-funciona" className="parallax-section parallax-grid py-24 sm:py-32">
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 text-xs font-medium">Simples como 1-2-3</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Em 3 passos simples
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Do cadastro à primeira reserva via IA em menos de 24 horas. Sem precisar de técnico ou conhecimento técnico.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => {
            const c = colorMap[step.color];
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                className="relative"
              >
                {/* Connector line (desktop) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[calc(100%-20%)] h-px bg-gradient-to-r from-white/10 to-white/5" />
                )}

                <div className={`relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group`}>
                  {/* Step number */}
                  <div className={`absolute -top-4 left-6 w-8 h-8 rounded-lg bg-gradient-to-br ${c.bg} ${c.border} border flex items-center justify-center shadow-lg ${c.glow}`}>
                    <span className={`text-xs font-bold ${c.text}`}>{step.num}</span>
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center mb-5 mt-2`}>
                    <step.icon className={`w-7 h-7 ${c.text}`} />
                  </div>

                  <h3 className="text-white font-bold text-lg mb-3">{step.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-5">{step.desc}</p>

                  {/* Form fields for step 1 */}
                  {step.fields && (
                    <div className="space-y-2 pt-4 border-t border-white/[0.04]">
                      {step.fields.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                          <span className="text-neutral-500 text-[11px]">{field}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-3 text-emerald-400/80 text-[10px]">
                        <Mail className="w-3 h-3" />
                        <Building className="w-3 h-3" />
                        <span>Cadastro simples e rápido</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-center mt-16"
        >
          <button
            onClick={() => {
              const el = document.querySelector('#precos');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 cursor-pointer"
          >
            Grátis por 7 dias
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}