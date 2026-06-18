'use client';

import { useRef, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calculator, Clock, DollarSign, ArrowRight, TrendingUp } from 'lucide-react';

export function SavingsCalculator() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [rooms, setRooms] = useState(8);

  const savings = useMemo(() => {
    const workingHours = Math.round(rooms * 2.5);
    const monthlySavings = Math.round(rooms * 48 * 7.2);
    const moreBookings = Math.round(rooms * 3.2);
    return { workingHours, monthlySavings, moreBookings };
  }, [rooms]);

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-[#060608]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Calculadora de economia
          </h2>
          <p className="text-neutral-400 text-lg">
            Menos trabalho. Mais dinheiro.
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                  {savings.workingHours}h
                </div>
                <div className="text-neutral-500 text-sm mt-1">menos trabalho/mês</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">
                  R${savings.monthlySavings.toLocaleString()}
                </div>
                <div className="text-neutral-500 text-sm mt-1">mais economia/mês</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">
                  +{savings.moreBookings}
                </div>
                <div className="text-neutral-500 text-sm mt-1">reservas adicionais/mês</div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-neutral-500 text-sm mb-4">
                Quer saber como calculamos isso? Teste grátis por 7 dias e veja na prática.
              </p>
              <button
                onClick={() => {
                  const el = document.querySelector('#precos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#0a0a0a] font-bold rounded-xl hover:bg-neutral-100 transition-all duration-200 shadow-xl cursor-pointer"
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
