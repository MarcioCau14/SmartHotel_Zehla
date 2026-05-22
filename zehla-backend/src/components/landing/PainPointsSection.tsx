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
  amber: 'text-[#FF5500] bg-[#FF5500]/10 border-amber-500/20',
  orange: 'text-[#FF5500] bg-[#FF5500]/10 border-orange-500/20',
  purple: 'text-[#FF5500] bg-[#FF5500]/10 border-purple-500/20',
  cyan: 'text-[#FF5500] bg-[#FF5500]/10 border-cyan-500/20',
  red: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export function PainPointsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 text-sm text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Seja honesto...</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
          Você se identifica com alguma{' '}
          <span className="text-rose-400">dessas situações?</span>
        </h2>
        <p className="text-[#898989] text-lg max-w-2xl mx-auto">
          Se você disse sim para pelo menos uma, o cérebro ZEHLA foi feito para resolver isso.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {painPoints.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-card p-6 border border-[#2e2e2e] hover:border-[#363636] transition-all duration-300 group"
          >
            <div
              className={`inline-flex p-3 rounded-xl ${colorMap[point.color]} mb-4`}
            >
              <point.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
              {point.title}
            </h3>
            <p className="text-sm text-[#898989] leading-relaxed">
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
        className="mt-12 glass-card p-6 border border-[#FF5500]/30 bg-[#FF5500]/[0.03] rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between text-left"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#FF5500]/10 text-orange-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#fafafa] mb-1 flex items-center gap-2">
              🚨 Atenção às Novas Regras do Ministério do Turismo (MTur)
            </h4>
            <p className="text-xs text-[#b4b4b4] leading-relaxed">
              O prazo para a implantação da <strong>FNRH Digital</strong> é <strong>20 de Abril de 2026</strong>. 
              Além disso, a obrigatoriedade da <strong>Diária de 24 horas</strong> já está em vigor. O agente ZEHLA atualiza e automatiza todos os seus fluxos legais para evitar multas de conformidade.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
