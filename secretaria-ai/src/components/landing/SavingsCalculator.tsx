'use client';

import { useRef, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calculator, Clock, DollarSign, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/numberFormat';

export function SavingsCalculator() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [rooms, setRooms] = useState(8);

  // Cálculos baseados em métricas realistas:
  // - Menos trabalho: 2.5 horas por quarto/mês (tempo economizado em atendimento)
  // - Mais economia: 48 horas x R$7,20 (custo médio de funcionário por hora)
  // - Mais reservas: 3.2 reservas adicionais por quarto (conversão IA)
  const savings = useMemo(() => {
    const workingHours = Math.round(rooms * 2.5); // Horas economizadas/mês
    const monthlySavings = Math.round(workingHours * 7.2); // Economia em R$ (custo funcionário)
    const moreBookings = Math.round(rooms * 3.2); // Reservas adicionais/mês
    const avgBookingValue = 480; // Valor médio de reserva
    const extraRevenue = moreBookings * avgBookingValue; // Receita extra
    return { workingHours, monthlySavings, moreBookings, extraRevenue };
  }, [rooms]);

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-[#060608]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Calculadora de economia
          </h2>
          <p className="text-neutral-400 text-lg mb-2">
            Menos trabalho. Mais dinheiro.
          </p>
          <p className="text-neutral-500 text-sm max-w-xl mx-auto">
            Veja quanto o ZÉLLA pode economizar e gerar para sua pousada com base no número de quartos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-3xl bg-[#111] border border-white/[0.06] p-8 sm:p-12 overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]" />

          <div className="relative z-10">
            {/* Input */}
            <div className="max-w-md mx-auto mb-10 text-center">
              <label className="block text-neutral-400 text-sm mb-3">
                Quantos quartos/apartamentos sua pousada tem?
              </label>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setRooms(Math.max(1, rooms - 1))}
                  className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white font-bold text-lg hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  -
                </button>
                <div className="w-24 h-14 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">{rooms}</span>
                </div>
                <button
                  onClick={() => setRooms(Math.min(50, rooms + 1))}
                  className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white font-bold text-lg hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                  {savings.workingHours}h
                </div>
                <div className="text-neutral-500 text-sm mt-1">menos trabalho/mês</div>
                <div className="flex items-start justify-center gap-1 mt-3 px-2">
                  <Info className="w-3 h-3 text-neutral-600 shrink-0 mt-0.5" />
                  <p className="text-neutral-600 text-[10px] text-left leading-relaxed">
                    2.5h/quarto economizadas em atendimento WhatsApp, check-in e check-out automatizados
                  </p>
                </div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">
                  R${formatCurrency(savings.monthlySavings)}
                </div>
                <div className="text-neutral-500 text-sm mt-1">economia mensal</div>
                <div className="flex items-start justify-center gap-1 mt-3 px-2">
                  <Info className="w-3 h-3 text-neutral-600 shrink-0 mt-0.5" />
                  <p className="text-neutral-600 text-[10px] text-left leading-relaxed">
                    Economia baseada no custo de R$7,20/hora (funcionário) x {savings.workingHours}h economizadas
                  </p>
                </div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">
                  +{savings.moreBookings}
                </div>
                <div className="text-neutral-500 text-sm mt-1">reservas adicionais/mês</div>
                <div className="flex items-start justify-center gap-1 mt-3 px-2">
                  <Info className="w-3 h-3 text-neutral-600 shrink-0 mt-0.5" />
                  <p className="text-neutral-600 text-[10px] text-left leading-relaxed">
                    ~3.2 reservas/quarto via IA (R${formatCurrency(savings.extraRevenue)} em receita extra)
                  </p>
                </div>
              </div>
            </div>

            {/* Additional explanation */}
            <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/15 mb-10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold mb-2">Como funciona o cálculo?</h4>
                  <div className="space-y-1.5 text-neutral-400 text-xs leading-relaxed">
                    <p>• <strong className="text-neutral-300">Menos trabalho:</strong> A IA responde 95% das mensagens WhatsApp, automatiza check-in/check-out, economizando ~2.5h por quarto/mês.</p>
                    <p>• <strong className="text-neutral-300">Mais economia:</strong> Com base no custo médio de funcionário (R$7,20/hora), você economiza R${formatCurrency(savings.monthlySavings)}/mês em custos operacionais.</p>
                    <p>• <strong className="text-neutral-300">Mais reservas:</strong> Respostas instantâneas (2s) aumentam conversão em ~40%, gerando ~3.2 reservas adicionais por quarto/mês.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-neutral-500 text-sm mb-4">
                Quer ver esses resultados na prática? Teste grátis por 7 dias.
              </p>
              <button
                onClick={() => {
                  const el = document.querySelector('#precos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-xl shadow-emerald-500/30 cursor-pointer"
              >
                Começar Grátis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}