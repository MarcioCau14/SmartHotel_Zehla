'use client';

import { motion } from 'framer-motion';
import {
  MessageCircleOff,
  Table,
  DollarSign,
  Clock,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

const painPoints = [
  {
    icon: MessageCircleOff,
    title: 'Perco reservas no WhatsApp',
    description:
      'Não consigo responder rápido o suficiente e os hóspedes acabam procurando outro lugar.',
    color: 'rose',
  },
  {
    icon: DollarSign,
    title: 'Taxas abusivas das OTAs',
    description:
      'Deixar 15% a 20% do faturamento com Booking e Airbnb pesa demais no final do mês. Falta venda direta.',
    color: 'orange',
  },
  {
    icon: Clock,
    title: 'Sem tempo para a família',
    description:
      'Trabalho 16h por dia cuidando de tudo na pousada. Falta tempo para lazer, melhorias e descanso.',
    color: 'amber',
  },
  {
    icon: Table,
    title: 'Planilhas para tudo',
    description:
      'Uso planilhas para controlar quartos, reservas, financeiro... e nada fica organizado.',
    color: 'purple',
  },
  {
    icon: HelpCircle,
    title: 'Não sei quanto estou faturando',
    description:
      'Não tenho controle claro de receita diária, ocupação real ou custo por hóspede.',
    color: 'cyan',
  },
  {
    icon: AlertTriangle,
    title: 'Check-in manual e demorado',
    description:
      'Meu check-in é todo manual e offline. O hóspede chega e eu corro para arrumar tudo.',
    color: 'red',
  },
];

const colorMap: Record<string, string> = {
  rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  amber: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
  orange: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
  purple: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
  cyan: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20',
  red: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export function PainPointsSection() {
  return (
    <section className="py-32 px-6 sm:px-8 max-w-6xl mx-auto relative z-10 border-t border-white/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong border border-rose-500/30 bg-rose-500/5 mb-6 text-xs font-black uppercase tracking-[0.15em] text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
          <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Seja honesto...</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight">
          Você se identifica com alguma{' '}
          <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(244,63,94,0.25)]">dessas situações?</span>
        </h2>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Se você disse sim para pelo menos uma, o cérebro ZEHLA foi feito para resolver isso.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {painPoints.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-strong border border-white/5 rounded-3xl p-7 hover:border-rose-500/25 transition-all duration-500 shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_30px_rgba(244,63,94,0.06)] group cursor-default"
          >
            <div
              className={`inline-flex p-3 rounded-2xl border ${colorMap[point.color]} mb-6 shadow-[0_0_10px_rgba(244,63,94,0.15)] group-hover:scale-105 transition-transform duration-300`}
            >
              <point.icon className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-2 tracking-tight group-hover:text-rose-400 transition-colors duration-300">
              {point.title}
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-medium">
              {point.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* MTur Regulation Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16 glass-strong border border-[#FF5500]/30 bg-[#FF5500]/[0.04] rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 justify-between text-left shadow-[0_15px_40px_rgba(255,85,0,0.1)] hover:border-[#FF5500]/50 transition-colors duration-500"
      >
        <div className="flex flex-col md:flex-row items-start gap-5">
          <div className="p-4 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] flex-shrink-0 shadow-[0_0_15px_rgba(255,85,0,0.2)]">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-black text-white mb-2 tracking-tight flex items-center gap-2">
              🚨 Atenção às Novas Regras do Ministério do Turismo (MTur)
            </h4>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-medium">
              O prazo para a implantação da <strong>FNRH Digital</strong> é <strong>20 de Abril de 2026</strong>. 
              Além disso, a obrigatoriedade da <strong>Diária de 24 horas</strong> já está em vigor. O agente ZEHLA atualiza e automatiza todos os seus fluxos legais para evitar multas de conformidade.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
