'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  AlertTriangle,
  MessageSquare,
  DollarSign,
  BarChart3,
  Users,
  Clock,
} from 'lucide-react';

const pains = [
  {
    icon: MessageSquare,
    title: 'Perco reservas no WhatsApp',
    desc: 'Hóspedes perguntam e você não responde a tempo. Cada mensagem sem resposta é dinheiro indo embora. A IA do ZÉLLA responde em 2 segundos, 24 horas por dia, com o tom da sua pousada.',
    color: 'emerald',
  },
  {
    icon: DollarSign,
    title: 'Preços parados no tempo',
    desc: 'Vender R$150 num feriado de R$350 é desperdício. O Cérebro ZÉLLA ajusta preços automaticamente baseado em demanda, sazonalidade e concorrência.',
    color: 'purple',
  },
  {
    icon: Users,
    title: 'Superlotação ou quartos vazios',
    desc: 'Uma semana lotada, outra deserta. O ZÉLLA prevê demanda com IA, sugere promoções estratégicas e mantém sua ocupação sempre acima de 70%.',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Não sei quanto estou faturando',
    desc: 'Fim de mês chegou e você não sabe se lucrou ou perdeu. O dashboard do ZÉLLA mostra em tempo real: ocupação, receita, custo por hóspede e projeção do mês.',
    color: 'amber',
  },
  {
    icon: Clock,
    title: 'Check-in manual e demorado',
    desc: 'Fila na recepção, formulários em papel, dados errados. O ZÉLLA automatiza check-in via WhatsApp e reduz o tempo de 10 minutos para 30 segundos.',
    color: 'pink',
  },
  {
    icon: AlertTriangle,
    title: 'Planilhas para tudo',
    desc: 'Reservas no WhatsApp, contabilidade no caderno, check-in no papel. O ZÉLLA centraliza tudo: reservas, pagamentos, check-in e métricas num único painel inteligente.',
    color: 'red',
  },
];

const colorMap: Record<string, { bg: string; accent: string; ring: string }> = {
  emerald: { bg: 'from-emerald-500 to-emerald-700', accent: 'bg-emerald-500/10', ring: 'border-emerald-500/20' },
  purple: { bg: 'from-purple-500 to-purple-700', accent: 'bg-purple-500/10', ring: 'border-purple-500/20' },
  blue: { bg: 'from-blue-500 to-blue-700', accent: 'bg-blue-500/10', ring: 'border-blue-500/20' },
  amber: { bg: 'from-amber-500 to-amber-700', accent: 'bg-amber-500/10', ring: 'border-amber-500/20' },
  pink: { bg: 'from-pink-500 to-pink-700', accent: 'bg-pink-500/10', ring: 'border-pink-500/20' },
  red: { bg: 'from-red-500 to-red-700', accent: 'bg-red-500/10', ring: 'border-red-500/20' },
};

export function PainPointsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-[#060608]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Você se identifica com alguma dessas situações?
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Se respondeu sim para pelo menos uma, o ZÉLLA foi feito para resolver exatamente isso. Sem complicação, sem jargão técnico — só resultado.
          </p>
        </motion.div>

        {/* Pain Cards — grid like reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pains.map((pain, i) => {
            const c = colorMap[pain.color];
            return (
              <motion.div
                key={pain.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-300 cursor-default`}
              >
                <div className={`w-10 h-10 rounded-xl ${c.accent} border ${c.ring} flex items-center justify-center mb-4`}>
                  <pain.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{pain.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{pain.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
