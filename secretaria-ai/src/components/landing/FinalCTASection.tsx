'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Brain, Zap, Shield, Star } from 'lucide-react';

export function FinalCTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.04] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10 blur-[120px]">
          <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-purple-500 to-blue-500 rounded-full" />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Sua pousada merece
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">um Zelador 24 por 7</span>
          </h2>

          <p className="text-neutral-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Enquanto você lê isso, sua concorrência está somando reservas no WhatsApp. O ZÉLLA coloca sua pousada no piloto automático — Ele vende, atende e otimiza 24 horas por dia. Comece grátis e veja resultados em 48 horas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => {
                const el = document.querySelector('#precos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 cursor-pointer text-lg"
            >
              <span className="flex items-center gap-2">
                Começar Grátis Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => {
                const el = document.querySelector('#como-funciona');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 font-semibold hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer"
            >
              Quero ser Parceiro
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-600 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500/40" />
              <span>Setup em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500/40" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-500/40" />
              <span>4.9/5 de avaliação</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}