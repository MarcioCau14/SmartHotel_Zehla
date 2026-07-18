'use client';

import { useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNiche } from '@/contexts/NicheContext';
import { getNicheContent } from '@/data/niche-content';

export function NicheSwitcherSection() {
  const { niche } = useNiche();
  const content = getNicheContent(niche);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-36 overflow-hidden border-t border-white/[0.03]">
      {/* Dynamic background image with crossfade */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${niche}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${content.switcher.backgroundImage})` }}
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0a0a0a]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dynamic glow orbs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`orbs-${niche}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 pointer-events-none z-[1]"
        >
          <div
            className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: content.switcher.glowColor }}
          />
          <div
            className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{
              background: niche === 'pousadas'
                ? 'rgba(20, 184, 166, 0.04)'
                : niche === 'anfitrioes'
                  ? 'rgba(139, 92, 246, 0.04)'
                  : 'rgba(217, 165, 32, 0.04)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] }}
          className="flex flex-col items-center text-center gap-8 sm:gap-10"
        >
          {/* Dynamic headline + subheadline */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${niche}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] }}
              className="flex flex-col items-center gap-7"
            >
              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.1] text-white max-w-4xl">
                {content.switcher.headline}{' '}
                <span className={
                  niche === 'pousadas'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent'
                    : niche === 'anfitrioes'
                      ? 'bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent'
                }>
                  {niche === 'pousadas' ? 'Reservas diretas.' : niche === 'anfitrioes' ? 'Escale seus imóveis.' : 'Economia real.'}
                </span>
              </h2>

              {/* Subheadline */}
              <p className="text-neutral-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl">
                {content.switcher.subheadline}
              </p>

              {/* Hero stat */}
              <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border ${
                niche === 'pousadas'
                  ? 'bg-emerald-500/[0.08] border-emerald-500/20'
                  : niche === 'anfitrioes'
                    ? 'bg-blue-500/[0.08] border-blue-500/20'
                    : 'bg-amber-500/[0.08] border-amber-500/20'
              }`}>
                <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  niche === 'pousadas' ? 'text-emerald-400' : niche === 'anfitrioes' ? 'text-blue-400' : 'text-amber-400'
                }`}>
                  {content.switcher.heroStat.val}
                </span>
                <span className="text-neutral-400 text-sm font-medium text-left">
                  {content.switcher.heroStat.label}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4"
          >
            <button
              onClick={() => {
                const el = document.querySelector('#como-funciona');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg cursor-pointer active:scale-95 ${
                niche === 'pousadas'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  : niche === 'anfitrioes'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/25 hover:shadow-blue-500/40'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/25 hover:shadow-amber-500/40'
              }`}
            >
              {content.switcher.ctaText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* "Not sure?" link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-neutral-600 text-sm"
          >
            Não tem certeza?{' '}
            <a
              href="#faq"
              className="text-neutral-400 hover:text-neutral-200 underline underline-offset-2 transition-colors"
            >
              Veja as diferenças
            </a>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
