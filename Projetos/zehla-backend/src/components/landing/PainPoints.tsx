'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Percent, TrendingUp, Sparkles } from 'lucide-react';

export function PainPoints() {
  const [dailyRate, setDailyRate] = useState(350);
  const [bookings, setBookings] = useState(20);
  const [selectedPlan, setSelectedPlan] = useState<'Lite' | 'Pro' | 'Max'>('Pro');

  const otaCommission = 0.20; // 20% on booking platforms
  const totalRevenue = dailyRate * bookings;
  const otaLoss = totalRevenue * otaCommission;

  const planData = {
    Lite: { base: 248, label: 'Lite (Sem Taxas)' },
    Pro: { base: 448, label: 'Pro (Sem Taxas)' },
    Max: { base: 798, label: 'Max (Sem Taxas)' },
  };

  const zehlaCost = planData[selectedPlan].base;
  const netSavings = otaLoss - zehlaCost;

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center z-10" id="calculadora">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FF5500]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Quanto você está <span className="text-[#FF5500]">deixando na mesa?</span>
        </h2>
        <p className="text-[#898989] text-base leading-relaxed">
          Simule as perdas mensais com as taxas abusivas das OTAs contra a assinatura fixa e sem comissões da ZEHLA.
        </p>
      </motion.div>

      <div className="bg-[#090909]/40 border border-white/5 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(255,85,0,0.02)]">
        <div className="grid sm:grid-cols-2 gap-8 mb-10">
          {/* Sliders */}
          <div className="space-y-6 text-left">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Valor Médio da Diária</span>
                <span className="text-[#FF5500] font-black">R$ {dailyRate}</span>
              </label>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Reservas por Mês</span>
                <span className="text-[#FF5500] font-black">{bookings}</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={bookings}
                onChange={(e) => setBookings(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#FF5500]"
              />
            </div>

            {/* Plan Picker */}
            <div className="pt-5 border-t border-white/5">
              <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Escolha o seu plano ZEHLA</span>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Lite', 'Pro', 'Max'] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedPlan === plan
                        ? 'bg-[#FF5500]/10 border-[#FF5500] text-[#FF5500]'
                        : 'bg-[#121212] border-white/5 text-[#b4b4b4] hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Percent className="w-5 h-5 text-rose-400" />
                <span className="text-sm font-medium text-white">Perdas OTAs (20%)</span>
              </div>
              <span className="text-lg font-bold text-rose-400">- R$ {otaLoss.toLocaleString('pt-BR')}</span>
            </div>

            <div className="p-4 bg-[#FF5500]/10 border border-[#FF5500]/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#FF5500]" />
                <span className="text-sm font-medium text-white">Assinatura ZEHLA</span>
              </div>
              <span className="text-lg font-bold text-[#FF5500]">R$ {zehlaCost.toLocaleString('pt-BR')}</span>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-white">Faturamento Mensal</span>
              </div>
              <span className="text-lg font-bold text-emerald-400">R$ {totalRevenue.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Final Comparison */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Economia Mensal com ZEHLA</span>
            <div className="text-3xl font-extrabold text-white tracking-tight mt-1">
              R$ {netSavings > 0 ? netSavings.toLocaleString('pt-BR') : '0'}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">Economia Anual Estimada</span>
            <div className="text-4xl font-black text-[#FF5500] tracking-tight mt-1">
              R$ {netSavings > 0 ? (netSavings * 12).toLocaleString('pt-BR') : '0'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
