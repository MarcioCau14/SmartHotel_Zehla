'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNiche } from '@/contexts/NicheContext';
import { NicheToggle } from './NicheToggle';

export function HeroSection() {
  const { niche, setNiche } = useNiche();

  // Rotating hero words
  const rotatingPhrases = [
    'pelo WhatsApp.',
    'a sua pousada.',
    'o seu imóvel.',
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % rotatingPhrases.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex items-center overflow-hidden bg-[#0a0a0a]">

      {/* Ambient glow */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-purple-500/[0.05] blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-10 pt-24 pb-16 sm:pt-32 sm:pb-20 w-full">
        <div className="flex flex-col items-center text-center">

          {/* ── Text Content ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] mb-8">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">
                Deixa com o Zélla
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Headline */}
            <h1 className="text-[1.5rem] sm:text-4xl md:text-[2.75rem] lg:text-[3.25rem] xl:text-[4rem] font-satoshi font-bold tracking-tight leading-[1.15] text-white mb-6 text-center">
              <span className="block">O Zélla atende, vende e</span>
              <span className="block text-blue-500 font-bold">
                reserva{' '}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIdx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                    className="inline-block whitespace-nowrap"
                  >
                    {rotatingPhrases[phraseIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed mb-12 max-w-2xl mx-auto">
              O zelador digital que responde 24hs por 7. Atende os hóspedes com naturalidade, fecha a reserva aumentando seu tempo e seu dinheiro. Feito para pousadas e anfitriões de Airbnb.
            </p>

            {/* ── Niche Switcher — Escolha seu perfil ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.04]">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                  Escolha seu perfil
                </span>
              </div>

              {/* 3-toggle buttons */}
              <NicheToggle niche={niche} onNicheChange={setNiche} />

              {/* CTA under toggle — context-aware */}
              <motion.div
                key={`cta-${niche}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {niche === 'parceiro' ? (
                  <a
                    href="/parceiro"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-xl shadow-amber-500/25 text-sm active:scale-95"
                  >
                    Quero ser parceiro
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      const el = document.querySelector('#precos');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`group inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold rounded-xl transition-all duration-200 shadow-xl text-sm active:scale-95 ${
                      niche === 'pousadas'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-blue-500/25'
                    }`}
                  >
                    Conhecer planos
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </motion.div>
            </motion.div>

            {/* ── Social proof — below toggles ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm text-neutral-400 font-medium mt-12"
            >
              <div className="flex -space-x-2.5">
                {[
                  { name: 'Pousada Serenity', img: '/avatar-serenity.jpg' },
                  { name: 'Pousada Sol & Mar', img: '/pousada-vista.jpg' },
                  { name: 'Chalé da Montanha', img: '/pousada-chale.jpg' },
                  { name: 'Recanto Verde', img: '/pousada-jardim.jpg' }
                ].map((p, i) => (
                  <div key={i} className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm relative" style={{ zIndex: 40 - i * 10 }}>
                    <div className="w-full h-full rounded-full border border-[#0a0a0a] overflow-hidden bg-zinc-900">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-cover select-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <span className="sm:border-l sm:border-white/10 sm:pl-6 text-neutral-400 font-semibold">+100 pousadas já atendem melhor com o Zélla</span>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
