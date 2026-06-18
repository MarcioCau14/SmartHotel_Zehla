'use client';

import { motion } from 'framer-motion';
import { X, TrendingUp, AlertCircle, Zap, ShieldCheck } from 'lucide-react';

interface RevenueReportEliteProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    pousada: string;
    idp: number;
    gap: string;
    diagnostico: string;
    pitch: string;
    preco: string;
  };
}

export function RevenueReportElite({ isOpen, onClose, lead }: RevenueReportEliteProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl overflow-hidden bg-[#f5f4f3] rounded-3xl shadow-2xl border border-white/20"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Background Grid Pattern (HABILITY_DESIGN Style) */}
        <div className="absolute inset-0 z-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(43,148,183,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(43,148,183,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

        {/* Accent Anchor Line */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#2b94b7] z-10" />

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <X size={20} className="text-[#1d1c1a]/40" />
          </button>

          <header className="mb-10">
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#2b94b7] uppercase mb-4 block">
              DIAGNÓSTICO DE RECEITA ELITE
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1d1c1a] leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lead.pousada}
            </h2>
            <div className="h-px w-24 bg-[#2b94b7]/30 mb-6" />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* IDP Metric */}
            <div className="bg-white/50 p-6 rounded-2xl border border-[#2b94b7]/10 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={18} className="text-[#2b94b7]" />
                <span className="text-xs font-bold text-[#1d1c1a]/60 uppercase tracking-wider">IDP Estimado</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-[#1d1c1a]">{lead.idp}%</span>
                <span className="text-xs font-bold text-[#2b94b7] mb-2">Produtividade</span>
              </div>
              <div className="mt-4 w-full h-1.5 bg-[#2b94b7]/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${lead.idp}%` }}
                  className="h-full bg-[#2b94b7]"
                />
              </div>
            </div>

            {/* Price Gap */}
            <div className="bg-white/50 p-6 rounded-2xl border border-[#2b94b7]/10 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle size={18} className="text-[#2b94b7]" />
                <span className="text-xs font-bold text-[#1d1c1a]/60 uppercase tracking-wider">Gap de Preço</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-black px-4 py-1 rounded-lg ${
                  lead.gap === 'CRITICAL' ? 'bg-red-500/10 text-red-600' : 'bg-[#2b94b7]/10 text-[#2b94b7]'
                }`}>
                  {lead.gap}
                </span>
                <span className="text-sm font-medium text-[#1d1c1a]/50">vs Mercado</span>
              </div>
              <p className="mt-4 text-xs text-[#1d1c1a]/60 leading-relaxed">
                Diária Base Analisada: <strong>{lead.preco}</strong>
              </p>
            </div>
          </div>

          <section className="space-y-6 mb-12">
            <div>
              <h3 className="text-sm font-black text-[#1d1c1a] uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#2b94b7]" />
                Auditoria Técnica
              </h3>
              <p className="text-[#1d1c1a]/80 leading-relaxed text-sm italic">
                "{lead.diagnostico}"
              </p>
            </div>

            <div className="bg-[#1d1c1a] p-6 rounded-2xl text-white shadow-xl">
              <h3 className="text-xs font-bold text-[#2b94b7] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <Zap size={14} fill="#2b94b7" />
                Script Matador (WhatsApp)
              </h3>
              <p className="text-lg font-medium leading-snug">
                {lead.pitch}
              </p>
            </div>
          </section>

          <footer className="flex justify-between items-center pt-6 border-t border-[#1d1c1a]/5">
            <span className="text-[10px] text-[#1d1c1a]/40 font-medium">
              GERADO POR: SECRETARIA-IA v2.5 | ZEHLA SMARTHOTEL
            </span>
            <button 
              className="bg-[#2b94b7] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#237d9a] transition-all shadow-lg shadow-[#2b94b7]/20"
            >
              DISPARAR ABORDAGEM
            </button>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
