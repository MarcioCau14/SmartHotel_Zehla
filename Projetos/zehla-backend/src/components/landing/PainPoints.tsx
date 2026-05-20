'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Percent, TrendingUp, Sparkles } from 'lucide-react';

export function PainPoints() {
  const [dailyRate, setDailyRate] = useState(350);
  const [bookings, setBookings] = useState(20);
  const [selectedPlan, setSelectedPlan] = useState<'Lite' | 'Pro' | 'Max'>('Pro');

  const otaCommission = 0.20; // 20%
  const totalRevenue = dailyRate * bookings;
  const otaLoss = totalRevenue * otaCommission;

  const planData = {
    Lite: { fee: 0.05, base: 248, label: 'Lite (5%)' },
    Pro: { fee: 0.02, base: 448, label: 'Pro (2%)' },
    Max: { fee: 0.00, base: 798, label: 'Max (0%)' },
  };

  const zehlaCost = totalRevenue * planData[selectedPlan].fee + planData[selectedPlan].base;
  const netSavings = otaLoss - zehlaCost;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center" id="calculadora">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
          Quanto você está <span className="text-orange-500">deixando na mesa?</span>
        </h2>
        <p className="text-[#898989] text-lg">
          Simule as perdas mensais com as comissões das OTAs contra as taxas transparentes da ZEHLA.
        </p>
      </motion.div>

      <div className="glass-card p-6 sm:p-10 border border-[#2e2e2e] bg-[#111111]/50 backdrop-blur-xl rounded-2xl">
        <div className="grid sm:grid-cols-2 gap-8 mb-10">
          {/* Sliders */}
          <div className="space-y-6 text-left">
            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2 flex justify-between">
                <span>Valor Médio da Diária</span>
                <span className="text-orange-500 font-bold">R$ {dailyRate}</span>
              </label>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full h-2 bg-[#2e2e2e] rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2 flex justify-between">
                <span>Reservas por Mês</span>
                <span className="text-orange-500 font-bold">{bookings}</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={bookings}
                onChange={(e) => setBookings(Number(e.target.value))}
                className="w-full h-2 bg-[#2e2e2e] rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Plan Picker */}
            <div className="pt-4 border-t border-[#2e2e2e]">
              <span className="block text-sm font-medium text-[#fafafa] mb-3">Escolha o seu plano ZEHLA</span>
              <div className="grid grid-cols-3 gap-2">
                {(['Lite', 'Pro', 'Max'] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedPlan === plan
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                        : 'bg-neutral-900 border-[#2e2e2e] text-[#b4b4b4] hover:border-white/10'
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
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Percent className="w-5 h-5 text-red-400" />
                <span className="text-sm text-[#fafafa]">Perdas p/ Booking/Airbnb (20%)</span>
              </div>
              <span className="text-lg font-bold text-red-400">- R$ {otaLoss.toLocaleString('pt-BR')}</span>
            </div>

            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-[#fafafa]">Investimento ZEHLA {planData[selectedPlan].label}</span>
              </div>
              <span className="text-lg font-bold text-orange-400">R$ {zehlaCost.toLocaleString('pt-BR')}</span>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm text-[#fafafa]">Faturamento Mensal Bruto</span>
              </div>
              <span className="text-lg font-bold text-green-400">R$ {totalRevenue.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Final Comparison */}
        <div className="border-t border-[#2e2e2e] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-sm text-[#898989]">Economia Mensal com ZEHLA</span>
            <div className="text-2xl font-bold text-[#fafafa]">
              R$ {netSavings > 0 ? netSavings.toLocaleString('pt-BR') : '0'}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-sm text-orange-400 font-medium">Economia Anual Estimada</span>
            <div className="text-3xl font-extrabold text-orange-500">
              R$ {netSavings > 0 ? (netSavings * 12).toLocaleString('pt-BR') : '0'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
