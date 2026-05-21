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
    <section className="vzap-section-gray vzap-section-padding px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center" id="calculadora">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h2 className="vzap-heading">
          Quanto você está <span style={{ color: '#1c66de' }}>deixando na mesa?</span>
        </h2>
        <p style={{ color: '#707070', fontSize: '18px', fontFamily: "'Archivo', sans-serif" }}>
          Simule as perdas mensais com as comissões das OTAs contra as taxas transparentes da ZEHLA.
        </p>
      </motion.div>

      <div className="vzap-card p-6 sm:p-10" style={{ borderRadius: '3px' }}>
        <div className="grid sm:grid-cols-2 gap-8 mb-10">
          {/* Sliders */}
          <div className="space-y-6 text-left">
            <div>
              <label className="block text-sm font-medium mb-2 flex justify-between" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
                <span>Valor Médio da Diária</span>
                <span style={{ color: '#1c66de', fontWeight: 700 }}>R$ {dailyRate}</span>
              </label>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{ backgroundColor: '#e8f1f8', accentColor: '#1c66de' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex justify-between" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
                <span>Reservas por Mês</span>
                <span style={{ color: '#1c66de', fontWeight: 700 }}>{bookings}</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={bookings}
                onChange={(e) => setBookings(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{ backgroundColor: '#e8f1f8', accentColor: '#1c66de' }}
              />
            </div>

            {/* Plan Picker */}
            <div className="pt-4 border-t" style={{ borderColor: '#ebebeb' }}>
              <span className="block text-sm font-medium mb-3" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>Escolha o seu plano ZEHLA</span>
              <div className="grid grid-cols-3 gap-2">
                {(['Lite', 'Pro', 'Max'] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedPlan === plan
                        ? 'bg-[#1c66de]/10 border-[#1c66de] text-[#1c66de]'
                        : 'bg-white border-[#ebebeb] text-[#707070] hover:border-[#1c66de]/30'
                    }`}
                    style={{ fontFamily: "'Archivo', sans-serif" }}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="p-4 border rounded-xl flex items-center justify-between" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="flex items-center gap-3">
                <Percent className="w-5 h-5" style={{ color: '#dc2626' }} />
                <span className="text-sm" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>Perdas p/ Booking/Airbnb (20%)</span>
              </div>
              <span className="text-lg font-bold" style={{ color: '#dc2626' }}>- R$ {otaLoss.toLocaleString('pt-BR')}</span>
            </div>

            <div className="p-4 border rounded-xl flex items-center justify-between" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" style={{ color: '#1c66de' }} />
                <span className="text-sm" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>Investimento ZEHLA {planData[selectedPlan].label}</span>
              </div>
              <span className="text-lg font-bold" style={{ color: '#1c66de' }}>R$ {zehlaCost.toLocaleString('pt-BR')}</span>
            </div>

            <div className="p-4 border rounded-xl flex items-center justify-between" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5" style={{ color: '#16c69a' }} />
                <span className="text-sm" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>Faturamento Mensal Bruto</span>
              </div>
              <span className="text-lg font-bold" style={{ color: '#16c69a' }}>R$ {totalRevenue.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Final Comparison */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: '#ebebeb' }}>
          <div className="text-left">
            <span className="text-sm" style={{ color: '#707070', fontFamily: "'Archivo', sans-serif" }}>Economia Mensal com ZEHLA</span>
            <div className="text-2xl font-bold" style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}>
              R$ {netSavings > 0 ? netSavings.toLocaleString('pt-BR') : '0'}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-sm font-medium" style={{ color: '#1c66de', fontFamily: "'Archivo', sans-serif" }}>Economia Anual Estimada</span>
            <div className="text-3xl font-extrabold" style={{ color: '#1c66de', fontFamily: "'Archivo', sans-serif" }}>
              R$ {netSavings > 0 ? (netSavings * 12).toLocaleString('pt-BR') : '0'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
