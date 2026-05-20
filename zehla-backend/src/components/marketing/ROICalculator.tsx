'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Wallet, ArrowRight, AlertTriangle } from 'lucide-react';

export function ROICalculator() {
  const [messagesPerDay, setMessagesPerDay] = useState(10);
  const [dailyRate, setDailyRate] = useState(450);

  // Lógica: 10% de conversão conservadora das mensagens perdidas
  const lostReservationsPerMonth = (messagesPerDay * 30) * 0.1;
  const lostMoneyPerMonth = lostReservationsPerMonth * dailyRate;

  return (
    <div className="glass-card bg-[#0a0a0a] border-white/5 p-8 md:p-12 max-w-4xl mx-auto overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <TrendingDown className="w-24 h-24 text-red-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Sliders */}
        <div className="space-y-10">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#898989]">
                Consultas sem resposta por dia
              </label>
              <span className="text-sm font-mono text-white">{messagesPerDay}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={messagesPerDay}
              onChange={(e) => setMessagesPerDay(parseInt(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#898989]">
                Valor médio da sua diária
              </label>
              <span className="text-sm font-mono text-white">R$ {dailyRate}</span>
            </div>
            <input 
              type="range" 
              min="150" 
              max="2500" 
              step="50"
              value={dailyRate}
              onChange={(e) => setDailyRate(parseInt(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[11px] text-[#4d4d4d] leading-relaxed">
              Estimamos uma conversão conservadora de 10% sobre as mensagens perdidas enquanto você dorme ou está ocupado.
            </p>
          </div>
        </div>

        {/* Result */}
        <div className="text-center md:text-left space-y-6">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
              Dinheiro que escapa do seu bolso
            </h4>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-2xl font-bold text-white">R$</span>
              <motion.span 
                key={lostMoneyPerMonth}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl md:text-6xl font-black text-white tracking-tighter"
              >
                {lostMoneyPerMonth.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </motion.span>
              <span className="text-sm font-bold text-[#4d4d4d]">/mês</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-[#898989] leading-relaxed">
              Este valor é o que você deixa de ganhar todos os meses por não ter o ZEHLA atendendo seu hóspede em <span className="text-white font-bold">3 segundos</span>.
            </p>
            
            <button className="w-full md:w-auto px-8 py-4 bg-white text-black hover:bg-orange-500 hover:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
              <Wallet className="w-4 h-4" />
              Recuperar esse lucro agora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
