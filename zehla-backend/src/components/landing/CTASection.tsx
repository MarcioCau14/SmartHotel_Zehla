'use client';

import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onNavigate?: () => void;
}

export function CTASection({ onNavigate }: CTASectionProps) {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FF5500]/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center bg-[#090909]/60 border border-white/5 backdrop-blur-xl p-12 sm:p-16 rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(255,85,0,0.03)]"
      >
        {/* Internal Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.08),transparent_75%)] pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Pronto para transformar{' '}
            <span className="text-[#FF5500]">sua pousada?</span>
          </h2>
          
          <p className="text-[#898989] text-lg mb-8 max-w-2xl mx-auto">
            Comece seu teste gratuito de 7 dias hoje. Sem comissões ocultas. Sem taxas surpresas.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                type="button"
                onClick={onNavigate}
                className="inline-flex items-center gap-2.5 px-8 py-4.5 bg-[#FF5500] hover:bg-[#ff6a1a] text-white font-bold rounded-xl transition-all duration-200 shadow-xl shadow-[#FF5500]/20 hover:shadow-[#FF5500]/30 text-lg cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-current" />
                Testar Grátis por 7 Dias
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
          
          <p className="text-xs text-[#555555] mt-6 tracking-wide uppercase">
            Setup em 10 min • Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </motion.div>
    </section>
  );
}
