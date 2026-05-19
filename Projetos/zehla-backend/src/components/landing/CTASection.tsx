import { Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';


'use client';


interface CTASectionProps {
  onNavigate?: () => void;
}

export function CTASection(: void { onNavigate }: CTASectionProps) {
  try {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center glass-strong p-12 sm:p-16 rounded-2xl relative overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.06),transparent_70%)]" />

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#fafafa] mb-4">
            Pronto para transformar{' '}
            <span className="gradient-text">sua pousada?</span>
          </h2>
          <p className="text-[#898989] text-lg mb-8 max-w-2xl mx-auto">
            Comece seu teste gratuito de 7 dias. Sem cartão. Sem compromisso.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                type="button"
                onClick={onNavigate}
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 text-lg cursor-pointer"
              >
                <Zap className="w-5 h-5" />
                Testar Grátis por 7 Dias
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
          <p className="text-sm text-[#363636] mt-6">
            Setup em 10 min • Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </motion.div>
    </section>
  );
}
