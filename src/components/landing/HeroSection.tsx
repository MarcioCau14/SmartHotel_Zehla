'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNiche } from '@/contexts/NicheContext';
import { NicheToggle } from './NicheToggle';

export function HeroSection() {
  const { niche, setNiche, isPousada, isAirbnb } = useNiche();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rotating hero words — ALL 3 phrases rotate together regardless of niche
  const rotatingPhrases = ['pelo WhatsApp.', 'seu imóvel.', 'sua pousada.'];
  const rotatingPhrasesLength = rotatingPhrases.length;
  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => {
    setPhraseIdx(0);
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % rotatingPhrasesLength);
    }, 2800);
    return () => clearInterval(interval);
  }, [rotatingPhrasesLength]);

  return (
    <section className="relative flex items-center overflow-hidden bg-[#0a0a0a]">

      {/* Ambient glow */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-purple-500/[0.05] blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-10 pt-28 pb-8 sm:pt-36 sm:pb-12 w-full">
        <div className="flex flex-col items-center text-center">

          {/* ── Text Content ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] mb-8">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">
                Deixa com o Zélla
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Headline — ultra-bold, dominant for premium value perception (ollow.com.br inspired) */}
            <h1 className="text-[2.25rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.25rem] xl:text-[6rem] font-satoshi font-extrabold tracking-tight leading-[1.05] text-white mb-8 text-center">
              <span className="block">O Zélla atende, vende e</span>
              <span className="block whitespace-nowrap text-blue-500 font-bold">
                reserva{' '}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIdx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                    className="inline-block"
                  >
                    {rotatingPhrases[phraseIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-neutral-400 leading-relaxed mb-12 max-w-2xl mx-auto">
              {!mounted ? 'O zelador digital que responde 24hs por 7. Atende os hóspedes com naturalidade, fecha a reserva aumentando seu tempo e seu dinheiro. Feito para pousadas.' :
              isPousada
                ? 'O zelador digital que responde 24hs por 7. Atende os hóspedes com naturalidade, fecha a reserva aumentando seu tempo e seu dinheiro. Feito para pousadas.'
                : isAirbnb
                ? 'O zelador digital que responde 24hs por 7. Atende seus hóspedes com naturalidade, fecha a reserva aumentando seu tempo e seu dinheiro. Feito para anfitriões Airbnb. O Zélla AirB é seu co-anfitrião digital.'
                : 'O programa de parceria que congela seu preço por 24 meses. Plano PRO completo por R$247/mês com selo exclusivo de parceiro no Link-in-Bio.'}
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
            </motion.div>

            {/* ── Social proof — below toggles ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm text-neutral-400 font-medium mt-8"
            >
              <div className="flex -space-x-2.5">
                {([
                      { name: isAirbnb ? 'Flat Copacabana' : 'Pousada Serenity', img: '/avatar-serenity.jpg' },
                      { name: isAirbnb ? 'Chalé Campos' : 'Pousada Sol & Mar', img: '/pousada-vista.jpg' },
                      { name: isAirbnb ? 'Apartamento Centro' : 'Chalé da Montanha', img: '/pousada-chale.jpg' },
                      { name: isAirbnb ? 'Studio Paulista' : 'Recanto Verde', img: '/pousada-jardim.jpg' },
                    ]).map((p, i) => (
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
              <span className="sm:border-l sm:border-white/10 sm:pl-6 text-neutral-300 font-bold">{isPousada ? '+100 pousadas já atendem melhor com o Zélla' : '+100 anfitriões já atendem melhor com o Zélla'}</span>
            </motion.div>

            {/* ── CTA button — below social proof ── */}
            <motion.div
              key={`cta-${niche}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.75 }}
              className="mt-7"
            >
              {niche === 'airbnb' ? (
                <a
                  href="/parceiro"
                  className="group inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold rounded-2xl hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 text-base active:scale-95 hover:scale-[1.03]"
                >
                  Quero ser parceiro
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <button
                  onClick={() => {
                    const el = document.querySelector('#precos');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group inline-flex items-center justify-center gap-2.5 px-10 py-4 font-extrabold rounded-2xl transition-all duration-200 shadow-2xl text-base active:scale-95 hover:scale-[1.03] ${
                    niche === 'pousada'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/30 hover:shadow-emerald-500/50'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-blue-500/30 hover:shadow-blue-500/50'
                  }`}
                >
                  Conhecer planos
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
